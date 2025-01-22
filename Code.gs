// Function to get the current month and year
function getMonthYear() {
  const date = new Date();
  const options = { month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Function to create an HTML list from updates
function createUpdatesList(updates) {
  return updates.map(update => `<li>${update}</li>`).join('');
}

// Function to send the newsletter
function sendNewsletter() {
  const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
  
  try {
    // First, extract content from Google Doc
    const newsletterContent = getNewsletterContent(DOC_ID);
    
    // Get the HTML template
    const template = HtmlService.createTemplateFromFile('guild_newsletter');
    
    // Get the background image from Drive
    const backgroundImageId = PropertiesService.getScriptProperties().getProperty('BACKGROUND_IMAGE_ID');
    const file = DriveApp.getFileById(backgroundImageId);
    if (!file) {
      throw new Error('Could not find image file in Drive');
    }
    const backgroundImage = file.getBlob().setName("newsletterBackground");
    
    // Set the dynamic content from Google Doc
    template.monthYear = getMonthYear();
    template.year = new Date().getFullYear();
    
    // Add the newsletter content to the template
    Object.assign(template, newsletterContent);
    
    // Generate the final HTML
    const htmlContent = template.evaluate().getContent();
    
    // Get email addresses from sheet
    const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getActiveSheet();
    const emailAddresses = sheet.getRange('A2:A' + sheet.getLastRow()).getValues()
                               .flat()
                               .filter(email => email.length > 0);
    
    // Send to each recipient
    emailAddresses.forEach(email => {
      MailApp.sendEmail({
        to: email,
        subject: "SPCNG Guild Newsletter - " + getMonthYear(),
        htmlBody: htmlContent,
        inlineImages: {
          newsletterBackground: backgroundImage
        }
      });
    });
    
    Logger.log(`Newsletter sent successfully to ${emailAddresses.length} recipients`);
  } catch (error) {
    console.error('Error in sendNewsletter:', error);
    throw error;
  }
}

// Function to send a test newsletter to yourself
function sendTestNewsletter() {
  const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
  
  try {
    // First, extract content from Google Doc
    const newsletterContent = getNewsletterContent(DOC_ID);
    
    const userEmail = Session.getActiveUser().getEmail();
    const template = HtmlService.createTemplateFromFile('guild_newsletter');
    
    // Get the background image from Drive
    const backgroundImageId = PropertiesService.getScriptProperties().getProperty('BACKGROUND_IMAGE_ID');
    const file = DriveApp.getFileById(backgroundImageId);
    if (!file) {
      throw new Error('Could not find image file in Drive');
    }
    const backgroundImage = file.getBlob().setName("newsletterBackground");
    
    // Set the dynamic content from Google Doc
    template.monthYear = getMonthYear();
    template.year = new Date().getFullYear();
    
    // Add the newsletter content to the template
    Object.assign(template, newsletterContent);
    
    // Generate the final HTML
    const htmlContent = template.evaluate().getContent();
    
    // Send the test email with inline image
    MailApp.sendEmail({
      to: userEmail,
      subject: "TEST - SPCNG Guild Newsletter - " + getMonthYear(),
      htmlBody: htmlContent,
      inlineImages: {
        newsletterBackground: backgroundImage
      }
    });
    
    Logger.log('Test newsletter sent successfully to ' + userEmail);
  } catch (error) {
    console.error('Error in sendTestNewsletter:', error);
    throw error;
  }
}
