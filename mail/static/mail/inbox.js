document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => {
    console.log("email sent");
    response.json();
  })
  .then(result => load_mailbox('sent'))
}




function open_email(email){
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'block';
  
  fetch(`/emails/${email['id']}`)
  .then(response => response.json())
  .then(email => {
    // Print email

    const element = document.querySelector('#email-content');
    element.innerHTML = `
      <div class="email-content">
      <ul style="list-style: none; padding-left: 0;">
        <li> <b>From:</b> ${email['sender']}</li>
        <li> <b>To:</b> ${email['recipients']}</li>
        <li> <b>Subject:</b> ${email['subject']}</li>
        <li> <b>Timestamp:</b> ${email['timestamp']}</li>
      </ul>
      <div class="email-body-view">
        ${email['body']}
      </div>
    `;

    fetch('/emails/' + email['id'], {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    }) 
    //create reply button 
    const reply = document.querySelector('#reply');
    reply.addEventListener('click', function(){
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#open-email-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = email['sender'];
      let subject = email['subject'];
      if (subject.split(" ", 1)[0] != "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;
      //document.querySelector('#compose-subject').value = 'Re: ' + email['subject'];

      document.querySelector('#compose-body').value = "\n\nOn " + email['timestamp'] + ", " + email['sender'] + ' wrote: ' + email['body'];
    });


    archive = document.querySelector('#archive-button');
    archive.innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
   
    archive.addEventListener('click', function(){
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email['archived']
        }) 
      }).then(response => {
        //console.log(response);
        load_mailbox('inbox');
        
        
      })
    });
  }); 
}


function load_mailbox(mailbox) {
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/'+ mailbox)
  .then(response => response.json())
  .then(emails => {
    // we have the emails, now need to display them on the page
    console.log(emails);
    emails.forEach(email => {
      const element = document.createElement('div');
      if (email['read'] === true ) {
        element.className = "email-list-view-read";
      } else {
        element.className = "email-list-view";
      }
      element.innerHTML = `
      ${email['sender']}: ${email['subject']} <span style="float: right;"> ${email['timestamp']}</span>
      `;
      element.addEventListener('click', () => open_email(email));
      document.querySelector('#emails-view').append(element);
    });
  });
}