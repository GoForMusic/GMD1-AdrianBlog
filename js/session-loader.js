document.addEventListener("DOMContentLoaded", function() {
    // Fetch JSON data
    fetch('./sessions/session.json')
        .then(response => response.json())
        .then(data => {
            // Generate HTML for each session
            data.forEach(session => {
                const sessionContainer = document.getElementById('sessions-container');
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session');

                sessionElement.innerHTML = `
                    <div class="session-content">
                        <div class="session-avatar">
                            <img src="${session.session_avatar}" alt="Avatar" class="avatar">
                        </div>
                        <div class="session-details">
                            <div class="session-title"><i class="file-icons fas fa-link"></i><a href="./pages/${session.session_url}" class="session-link">${session.session_title}</a></div>
                            <div class="session-date">${session.session_date}</div>
                            <div class="session-author">"Author: ${session.session_author}"</div>
                        </div>
                    </div>
                `;
                
                sessionContainer.appendChild(sessionElement);
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
});