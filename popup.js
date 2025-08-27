document.addEventListener("DOMContentLoaded", () => {
  const profileName = document.getElementById("profileName");
  const formData = document.getElementById("formData");
  const saveBtn = document.getElementById("saveProfile");
  const profilesList = document.getElementById("profiles");

  function loadProfiles() {
    chrome.storage.local.get("profiles", (data) => {
      profilesList.innerHTML = "";
      let profiles = data.profiles || {};
      for (let key in profiles) {
        let li = document.createElement("li");
        li.textContent = key;
        li.style.cursor = "pointer";
     li.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (profile) => {
        // Google Forms support
        for (let key in profile) {
          let value = profile[key];

          // Try matching inputs by aria-label (Google Forms labels)
          let fields = document.querySelectorAll(`[aria-label="${key}"]`);

          fields.forEach(field => {
            if (field.type === "radio" || field.type === "checkbox") {
              if (Array.isArray(value)) {
                value.forEach(val => {
                  if (field.value == val) field.checked = true;
                });
              } else {
                field.checked = (field.value == value || value === true);
              }
            } else if (field.tagName === "SELECT") {
              field.value = value;
            } else {
              field.value = value;
            }

            // Trigger input/change event so Google Forms recognizes it
            field.dispatchEvent(new Event("input", { bubbles: true }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
          });

          // For multiple choice questions (Google Forms uses labels)
          let labels = Array.from(document.querySelectorAll("div[role='radio'], div[role='checkbox']"));
          labels.forEach(label => {
            if (label.innerText.trim().toLowerCase() === String(value).toLowerCase()) {
              label.click();
            }
          });
        }
      },
      args: [profiles[key]]
    });
  });
};

        profilesList.appendChild(li);
      }
    });
  }

  saveBtn.addEventListener("click", () => {
    try {
      let parsedData = JSON.parse(formData.value);
      chrome.storage.local.get("profiles", (data) => {
        let profiles = data.profiles || {};
        profiles[profileName.value] = parsedData;
        chrome.storage.local.set({ profiles }, loadProfiles);
      });
    } catch (e) {
      alert("Invalid JSON format!");
    }
  });

  loadProfiles();
});

function fillForm(profile) {
  for (let key in profile) {
    let value = profile[key];
    let fields = document.querySelectorAll(`[name="${key}"], #${key}`);
    fields.forEach(field => {
      if (field.type === "radio" || field.type === "checkbox") {
        field.checked = (field.value == value || value === true);
      } else if (field.tagName === "SELECT") {
        field.value = value;
      } else {
        field.value = value;
      }
    });
  }
}
