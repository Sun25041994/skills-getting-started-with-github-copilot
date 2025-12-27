document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Title
        const title = document.createElement("h4");
        title.textContent = name;

        // Description
        const desc = document.createElement("p");
        desc.textContent = details.description;

        // Schedule
        const scheduleP = document.createElement("p");
        scheduleP.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        // Availability
        const availP = document.createElement("p");
        availP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const participantsTitle = document.createElement("strong");
        participantsTitle.textContent = "Participants:";
        participantsDiv.appendChild(participantsTitle);

        const ul = document.createElement("ul");
        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            const tag = document.createElement("span");
            tag.className = "participant-tag";
            tag.textContent = p;
            li.appendChild(tag);
            // Add Unregister button
            const unregisterBtn = document.createElement("button");
            unregisterBtn.className = "unregister-btn";
            unregisterBtn.title = "Unregister participant";
            unregisterBtn.textContent = "Unregister";
            unregisterBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              // Call API to unregister participant
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, {
                  method: "POST",
                });
                const result = await response.json();
                if (response.ok) {
                  // Refresh activities list
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "error";
                }
              } catch (error) {
                messageDiv.textContent = "Failed to unregister participant.";
                messageDiv.className = "error";
              }
            });
            li.appendChild(unregisterBtn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "none";
          li.textContent = "No participants yet";
          ul.appendChild(li);
        }
        participantsDiv.appendChild(ul);

        // Append to card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
