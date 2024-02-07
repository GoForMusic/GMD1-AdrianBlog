// Function to dynamically import highlight.js script
function importHighlightJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Function to fetch Markdown content and convert it to HTML
function fetchMarkdownAndConvertToHTML(sessionId) {
    // Fetch Markdown content and convert it to HTML
    fetch('../sessions/session.json')
        .then(response => response.json())
        .then(data => {
            // Find the session with the matching ID
            const session = data.find(session => session.session_url === `session.html?id=${sessionId}`);
            if (session) {
                // Fetch the Markdown content from the file
                fetch(session.session_content)
                    .then(response => response.text())
                    .then(markdownContent => {
                        // Generate table of contents
                        extractTableOfContentsFromMarkdown(markdownContent);


                        // Convert Markdown to HTML and apply syntax highlighting
                        convertMarkdownToHTMLAndPrettyPrint(markdownContent);
                    })
                    .catch(error => console.error('Error fetching Markdown content:', error));
            } else {
                // If session ID is not found, display an error message
                document.getElementById('session-title').textContent = 'Session not found';
                document.getElementById('session-author').textContent = '';
            }
        })
        .catch(error => console.error('Error fetching session data:', error));
}

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
            const id = title.toLowerCase().replace(/\s+/g, ''); // Generate id without spaces
            const listItem = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.textContent = title;
            anchor.href = `#${id}`; // Link to corresponding section using id
            anchor.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const section = document.getElementById(id); // Use id to find section
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
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

// Function to convert Markdown to HTML and apply syntax highlighting
function convertMarkdownToHTMLAndPrettyPrint(markdownContent) {
    // Convert Markdown to HTML
    const htmlContent = convertMarkdownToHTML(markdownContent);

    // Set the HTML content to the session-content element
    document.getElementById('session-content').innerHTML = htmlContent;

    // Apply syntax highlighting using hljs if available
    if (hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
}

function convertMarkdownToHTML(markdownContent) {
    // Replace Markdown code blocks with HTML code block tags
    const htmlContentWithCodeBlocks = markdownContent.replace(/```(\w+)?\s*\n([\s\S]+?)\n```/g, (match, language, code) => {
        if (language && hljs.getLanguage(language)) {
            // If language is specified and supported by highlight.js, use it for highlighting
            return `<pre><code class="hljs ${language}">${code}</code></pre>`;
        }
        // If language is not specified or not supported, use plain code block
        return `<pre><code>${code}</code></pre>`;
    });

    // Create a new instance of Showdown converter
    const converter = new showdown.Converter();
    // Convert Markdown with code blocks to HTML
    let htmlContent = converter.makeHtml(htmlContentWithCodeBlocks);

    // Add IDs to headings
    const headings = htmlContent.match(/<h[1-6]>(.*?)<\/h[1-6]>/g); // Match headings
    if (headings) {
        headings.forEach((heading, index) => {
            const id = `section-${index + 1}`;
            htmlContent = htmlContent.replace(heading, `<h${index + 1} id="${id}">$1</h${index + 1}>`);
        });
    }

    return htmlContent;
}

// Update session.js to use the new function
document.addEventListener("DOMContentLoaded", function() {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    console.log('Session ID:', sessionId); // Log session ID for debugging

    // Import highlight.js script and then fetch Markdown content
    importHighlightJS()
        .then(() => fetchMarkdownAndConvertToHTML(sessionId))
        .catch(error => console.error('Error importing highlight.js:', error));
});
