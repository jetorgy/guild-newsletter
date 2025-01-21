// Function to send the newsletter
function sendNewsletter() {
  // Get the HTML template
  const template = HtmlService.createTemplateFromFile('guild_newsletter');
  
  // Set the dynamic content
  template.monthYear = getMonthYear();
  template.year = new Date().getFullYear();
  template.mainStory = "Your main story goes here. This can be any important company update or announcement.";
  
  // Create the updates list
  const updates = [
    "Update 1: Company achieved milestone X",
    "Update 2: New project launched",
    "Update 3: Employee of the month announcement"
  ];
  
  template.updates = createUpdatesList(updates);
  
  // Generate the final HTML
  const htmlContent = template.evaluate().getContent();
  
  // Send the email
  MailApp.sendEmail({
    to: "recipient@example.com", // Replace with your recipient list
    subject: "Company Newsletter - " + getMonthYear(),
    htmlBody: htmlContent
  });
}

// Helper function to format month and year
function getMonthYear() {
  const date = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()] + " " + date.getFullYear();
}

// Helper function to create HTML list of updates
function createUpdatesList(updates) {
  return updates.map(update => `<li>${update}</li>`).join('');
}

// Function to send a test newsletter to yourself
function sendTestNewsletter() {
  // Get your email from your Google Account
  const userEmail = Session.getActiveUser().getEmail();
  
  // Get the HTML template
  const template = HtmlService.createTemplateFromFile('guild_newsletter');
  
  // Set the dynamic content
  template.monthYear = getMonthYear();
  template.year = new Date().getFullYear();
  template.mainStory = "This is a test newsletter. Your main story will go here.";
  
  const updates = [
    "Test Update 1",
    "Test Update 2",
    "Test Update 3"
  ];
  
  template.updates = createUpdatesList(updates);
  
  // Generate the final HTML
  const htmlContent = template.evaluate().getContent();
  
  // Send the test email to yourself
  MailApp.sendEmail({
    to: userEmail,
    subject: "TEST - Company Newsletter - " + getMonthYear(),
    htmlBody: htmlContent
  });
}
