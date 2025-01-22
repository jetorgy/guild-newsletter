// Function to get the current month and year
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

// Function to send the newsletter
function sendNewsletter() {
  try {
    // First, extract content from Google Doc
    const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
    const newsletterContent = getNewsletterContent(DOC_ID);
    
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
    
    // Add the Google Doc content
    Object.assign(template, newsletterContent);
    
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

// Function to send a test newsletter to yourself
function sendTestNewsletter() {
  try {
    // First, extract content from Google Doc
    const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
    const newsletterContent = getNewsletterContent(DOC_ID);
    
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
    
    // Add the Google Doc content
    Object.assign(template, newsletterContent);
    
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
