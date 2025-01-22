// Function to send the newsletter
function sendNewsletter() {
  try {
    // Get the HTML template
    const template = HtmlService.createTemplateFromFile('guild_newsletter');
    
    // Get the background image from Drive
    const backgroundImageId = '1eBwTG3_Er_FSbZGh9-aAiHpuHbYHnyBg';
    const file = DriveApp.getFileById(backgroundImageId);
    if (!file) {
      throw new Error('Could not find image file in Drive');
    }
    const backgroundImage = file.getBlob().setName("newsletterBackground");
    
    // Set the dynamic content
    template.monthYear = getMonthYear();
    template.year = new Date().getFullYear();
    template.mainStory = "Your main story goes here. This can be any important company update or announcement.";
    
    const updates = [
      "Update 1: Company achieved milestone X",
      "Update 2: New project launched",
      "Update 3: Employee of the month announcement"
    ];
    
    template.updates = createUpdatesList(updates);
    
    // Generate the final HTML
    const htmlContent = template.evaluate().getContent();
    
    // Send the email with inline image
    MailApp.sendEmail({
      to: "recipient@example.com",
      subject: "Company Newsletter - " + getMonthYear(),
      htmlBody: htmlContent,
      inlineImages: {
        newsletterBackground: backgroundImage
      }
    });
  } catch (error) {
    console.error('Error in sendNewsletter:', error);
    throw error;
  }
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
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const template = HtmlService.createTemplateFromFile('guild_newsletter');
    
    // Get the background image from Drive
    const backgroundImageId = '1eBwTG3_Er_FSbZGh9-aAiHpuHbYHnyBg';
    const file = DriveApp.getFileById(backgroundImageId);
    if (!file) {
      throw new Error('Could not find image file in Drive');
    }
    const backgroundImage = file.getBlob().setName("newsletterBackground");
    
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
    
    // Send the test email with inline image
    MailApp.sendEmail({
      to: userEmail,
      subject: "TEST - Company Newsletter - " + getMonthYear(),
      htmlBody: htmlContent,
      inlineImages: {
        newsletterBackground: backgroundImage
      }
    });
  } catch (error) {
    console.error('Error in sendTestNewsletter:', error);
    throw error;
  }
}
