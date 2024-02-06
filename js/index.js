document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM content loaded");
    sortSessions();
});

function sortSessions() {
    console.log("Sorting sessions...");
    var table = document.querySelector(".sessions-table");
    var sessions = Array.from(table.querySelectorAll(".session"));

    console.log("Sessions before sorting:");
    sessions.forEach(function(session) {
        console.log(session.querySelector(".session-date").textContent);
    });

    sessions.sort(function(a, b) {
        var dateA = new Date(a.querySelector(".session-date").textContent);
        var dateB = new Date(b.querySelector(".session-date").textContent);
        return dateB - dateA; // Changed to sort dates in descending order
    });

    console.log("Sessions after sorting:");
    sessions.forEach(function(session) {
        console.log(session.querySelector(".session-date").textContent);
    });

    sessions.forEach(function(session) {
        table.appendChild(session);
    });
}