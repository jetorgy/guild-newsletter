// Function to parse variable definitions from document sections
function parseVariableDefinitions(text) {
  Logger.log('Starting variable definitions parsing');
  const definitions = {};
  const sections = text.split('###').filter(section => section.trim());
  
  Logger.log('Found sections: [' + sections.map(s => s.split('\n')[0].trim()).join(', ') + ']');
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const sectionName = lines[0].trim();
    
    Logger.log('Processing section: "' + sectionName + '"');
    
    // Skip the Newsletter Content section as it contains the actual content
    if (sectionName !== 'Newsletter Content') {
      lines.slice(1).forEach(line => {
        if (line.includes('=')) {
          const [varName, placeholder] = line.split('=').map(part => part.trim());
          // Store the mapping between variable name and its placeholder
          // Extract just the name between {# and }
          const placeholderName = placeholder.match(/{#([^}]+)}/)?.[1] || placeholder;
          definitions[varName] = {
            placeholder: placeholderName,
            type: sectionName
          };
          Logger.log(`Added definition - Variable: "${varName}", Placeholder: "${placeholderName}", Type: "${sectionName}"`);
        }
      });
    }
  });
  
  Logger.log('Final definitions object: ' + JSON.stringify(definitions, null, 2));
  return definitions;
}

// Function to extract content using the variable definitions
function extractContent(text, definitions) {
  Logger.log('Starting content extraction');
  const contentSections = {};
  
  // Extract just the Newsletter Content section
  const sections = text.split('###');
  const newsletterSection = sections.find(section => section.trim().startsWith('Newsletter Content'));
  
  if (!newsletterSection) {
    Logger.log('Error: Newsletter Content section not found');
    return {};
  }
  
  const newsletterContent = newsletterSection.replace('Newsletter Content', '').trim();
  Logger.log('Newsletter content section extracted');
  
  // First extract the document title
  const docTitleDef = Object.entries(definitions).find(([_, def]) => def.type === 'Document Title');
  if (docTitleDef) {
    const [varName, def] = docTitleDef;
    const pattern = `\\{#${varName}\\}([\\s\\S]*?)\\{\\/${varName}\\}`;
    const match = new RegExp(pattern, 'g').exec(newsletterContent);
    if (match) {
      // Center align the title and add date below it
      contentSections.document_title = `<div style="text-align: center;"><h1>${match[1].trim()}</h1><p>${getMonthYear()}</p></div>`;
    }
  }
  
  // Extract main content section
  const mainTitleDef = Object.entries(definitions).find(([varName, def]) => varName === 'main_content_title');
  const mainContentDef = Object.entries(definitions).find(([varName, def]) => varName === 'main_content');
  
  if (mainTitleDef && mainContentDef) {
    const [titleVarName, titleDef] = mainTitleDef;
    const [contentVarName, contentDef] = mainContentDef;
    
    // Extract title
    const titlePattern = `\\{#${titleVarName}\\}([\\s\\S]*?)\\{\\/${titleVarName}\\}`;
    const titleMatch = new RegExp(titlePattern, 'g').exec(newsletterContent);
    if (titleMatch) {
      contentSections.main_content_title = `<h3>${titleMatch[1].trim()}</h3>`;
    }
    
    // Extract content
    const contentPattern = `\\{#${contentDef.placeholder}\\}([\\s\\S]*?)\\{\\/${contentDef.placeholder}\\}`;
    const contentMatch = new RegExp(contentPattern, 'g').exec(newsletterContent);
    if (contentMatch) {
      contentSections.main_content = formatContent(contentMatch[1].trim());
    }
  }
  
  // Extract section 1
  const section1TitleDef = Object.entries(definitions).find(([varName, def]) => varName === 'section_title_1');
  const section1ContentDef = Object.entries(definitions).find(([varName, def]) => varName === 'section_1_content');
  
  if (section1TitleDef && section1ContentDef) {
    const [titleVarName, titleDef] = section1TitleDef;
    const [contentVarName, contentDef] = section1ContentDef;
    
    // Extract title
    const titlePattern = `\\{#${titleVarName}\\}([\\s\\S]*?)\\{\\/${titleVarName}\\}`;
    const titleMatch = new RegExp(titlePattern, 'g').exec(newsletterContent);
    if (titleMatch) {
      contentSections.section_title_1 = `<h3>${titleMatch[1].trim()}</h3>`;
    }
    
    // Extract content
    const contentPattern = `\\{#${contentDef.placeholder}\\}([\\s\\S]*?)\\{\\/${contentDef.placeholder}\\}`;
    const contentMatch = new RegExp(contentPattern, 'g').exec(newsletterContent);
    if (contentMatch) {
      contentSections.section_1_content = formatContent(contentMatch[1].trim());
    }
  }
  
  // Extract section 2
  const section2TitleDef = Object.entries(definitions).find(([varName, def]) => varName === 'section_title_2');
  const section2ContentDef = Object.entries(definitions).find(([varName, def]) => varName === 'section_2_content');
  
  if (section2TitleDef && section2ContentDef) {
    const [titleVarName, titleDef] = section2TitleDef;
    const [contentVarName, contentDef] = section2ContentDef;
    
    // Extract title
    const titlePattern = `\\{#${titleVarName}\\}([\\s\\S]*?)\\{\\/${titleVarName}\\}`;
    const titleMatch = new RegExp(titlePattern, 'g').exec(newsletterContent);
    if (titleMatch) {
      contentSections.section_title_2 = `<h3>${titleMatch[1].trim()}</h3>`;
    }
    
    // Extract content
    const contentPattern = `\\{#${contentDef.placeholder}\\}([\\s\\S]*?)\\{\\/${contentDef.placeholder}\\}`;
    const contentMatch = new RegExp(contentPattern, 'g').exec(newsletterContent);
    if (contentMatch) {
      contentSections.section_2_content = formatContent(contentMatch[1].trim());
    }
  }
  
  // Extract signature
  const signatureDef = Object.entries(definitions).find(([varName, def]) => varName === 'signature');
  if (signatureDef) {
    const [varName, def] = signatureDef;
    const pattern = `\\{#${def.placeholder}\\}([\\s\\S]*?)\\{\\/${def.placeholder}\\}`;
    const match = new RegExp(pattern, 'g').exec(newsletterContent);
    if (match) {
      contentSections.signature = formatContent(match[1].trim());
    }
  }
  
  Logger.log('Final contentSections object: ' + JSON.stringify(contentSections, null, 2));
  const result = { contentSections, monthYear: getMonthYear(), year: new Date().getFullYear() };
  Logger.log('Final template data: ' + JSON.stringify(result, null, 2));
  return result;
}

// Function to format content with paragraphs and bullet points
function formatContent(content) {
  if (!content) return '';
  
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let html = '';
  let inList = false;
  
  lines.forEach(line => {
    if (line.match(/^[•\-\*]\s/)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `  <li>${line.replace(/^[•\-\*]\s*/, '')}</li>\n`;
    } else {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<p>${line}</p>\n`;
    }
  });
  
  if (inList) {
    html += '</ul>\n';
  }
  
  return html;
}

// Main function to extract newsletter content
function getNewsletterContent(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    const text = doc.getBody().getText();
    
    Logger.log('Full document text:');
    Logger.log(text);
    
    // First parse the variable definitions
    const definitions = parseVariableDefinitions(text);
    
    // Then extract content using those definitions
    return extractContent(text, definitions);
  } catch (error) {
    Logger.log('Error in getNewsletterContent: ' + error.toString());
    throw error;
  }
}

// Function to get the current month and year
function getMonthYear() {
  const date = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()] + " " + date.getFullYear();
}

// Function to test document access
function testDocAccess() {
  const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
  
  try {
    const content = getNewsletterContent(DOC_ID);
    Logger.log('Successfully extracted content:');
    Logger.log(content);
    return content;
  } catch (error) {
    Logger.log('Error testing document access:');
    Logger.log(error);
    throw error;
  }
} 