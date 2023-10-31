`use strict`;
console.log("Sanity check");

const form = document.getElementById("username-form");
const backendUrl = "http://localhost:8080";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postData = {
    username: form.elements["username"].value,
  };

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (data.success) {
    setTimeout(()=>window.location.reload(),2000)
  }
  else{
    console.error("Error:", data.error);
  }

});
