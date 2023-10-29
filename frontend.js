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
    
    const downloadBtn = document.getElementById("download");
    const img = document.getElementById("img");
    const noImg = document.getElementById("no-image");

    downloadBtn.classList.remove("no-download", "disable");

    downloadBtn.setAttribute("href", "./profile.jpg");

    noImg && noImg.remove();

    img.setAttribute("src", "./profile.jpg");
  }
  else{
    console.error("Error:", data.error);
  }

});

  // if (!(response.ok && response.status == "200")) {
  //   throw new Error("Invalid request!");
  // }


  // if (!data.status && !data.hasOwnProperty("url")) {
  //   throw new Error(response.error);
  // }