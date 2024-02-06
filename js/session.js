// Function to extract headings and generate table of contents from Markdown content
function extractTableOfContentsFromMarkdown(markdownContent) {
    const headings = markdownContent.match(/^#{1,}\s+.*/gm); // Match headings
    if (headings) {
        const tableOfContentsList = document.getElementById('table-of-contents-list');
        tableOfContentsList.innerHTML = ''; // Clear previous contents

        const nestedList = document.createElement('ul');
        let currentList = nestedList;
        let prevLevel = 0;

        headings.forEach((heading, index) => {
            const level = heading.match(/^#{1,}/)[0].length; // Get heading level
            const title = heading.replace(/^#{1,}\s+/, ''); // Get heading title
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.textContent = title;
            anchor.href = `#section-${index + 1}`; // Link to corresponding section
            listItem.appendChild(anchor);

            if (level > prevLevel) {
                const sublist = document.createElement('ul');
                currentList.appendChild(sublist);
                currentList = sublist;
            } else if (level < prevLevel) {
                let diff = prevLevel - level;
                while (diff > 0) {
                    currentList = currentList.parentElement.parentElement;
                    diff--;
                }
            }

            currentList.appendChild(listItem);
            prevLevel = level;
        });

        tableOfContentsList.appendChild(nestedList);
    }
}

// Function to convert Markdown to HTML
function convertMarkdownToHTML(markdownContent) {
    // Create a new instance of Showdown converter
    const converter = new showdown.Converter();
    // Convert Markdown to HTML
    const htmlContent = converter.makeHtml(markdownContent);
    return htmlContent;
}

// Update session.js to use the new function
document.addEventListener("DOMContentLoaded", function() {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    console.log('Session ID:', sessionId); // Log session ID for debugging

    // Fetch session data from JSON file
    fetch('../sessions/session.json')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data); // Log fetched data for debugging
            
            // Find the session with the matching ID
            const session = data.find(session => session.session_url === `session.html?id=${sessionId}`);
            console.log('Session:', session); // Log session for debugging
            
            // If session is found, update page content
            if (session) {
                document.getElementById('session-title').textContent = session.session_title;
                document.getElementById('session-date').textContent = session.session_date;
                document.getElementById('session-author').textContent = session.session_author;
                document.getElementById('session-avatar').src = session.session_avatar;

                // Fetch the Markdown content from the file
                fetch(session.session_content) // Assuming session_content contains the path to the MD file
                    .then(response => response.text())
                    .then(markdownContent => {
                        // Convert Markdown to HTML
                        const htmlContent = convertMarkdownToHTML(markdownContent);
                        // Set the HTML content to the session-content element
                        document.getElementById('session-content').innerHTML = htmlContent;

                        // Extract and populate table of contents from Markdown content
                        extractTableOfContentsFromMarkdown(markdownContent);
                    })
                    .catch(error => console.error('Error fetching Markdown content:', error));
            } else {
                // If session ID is not found, display an error message
                document.getElementById('session-title').textContent = 'Session not found';
                document.getElementById('session-author').textContent = '';
            }
        })
        .catch(error => console.error('Error fetching session data:', error));
});