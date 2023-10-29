import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// config
import "dotenv/config";

// automation imports
import puppeteer from "puppeteer";

// scrape
import request from "request";
import fs from "fs";

const app = express();
const port = 8080;

/*By adding app.use(cors()); to your code, you are allowing requests from any origin to access your server. If you want to restrict it to a specific origin, you can pass a configuration object to cors(). For example:
 */
// app.use(cors());

const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
};
// middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json()); // To access the request body in the form of JSON, you need to use a middleware like express.json() or body-parser

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/", async (req, res) => {
  try {
    const imageURl = await automateSite(req.body.username);
    res.setHeader("Content-type", "application/json");

    if (imageURl) {
      res.status(200).json({ success: true, url: "profile.jpg" });
    } else {
      res.status(500).json({ success: false, error: "Profile not found!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const automateSite = async function (username) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const instagramUrl = "https://www.instagram.com/";
  try {
    await page.goto(instagramUrl);

    /*
     * BEFORE LOGIN
     */
    await page.waitForSelector('input[name="username"]', { visible: true });

    await page.type('input[name="username"]', process.env.USERID, {
      delay: 100,
    });
    await page.type('input[name="password"]', process.env.PASSWORD, {
      delay: 50,
    });

    await page.click('button[type="submit"]');

    /*
     * AFTER LOGIN
     */
    const searchTimeout = 10000;

    const searchButtonSelector = 'div:has( > svg[aria-label="Search"])';
    await page.waitForSelector(searchButtonSelector, {
      visible: true,
      timeout: searchTimeout,
    });

    if (!(await page.$(searchButtonSelector))) {
      throw new Error("Search button not found within the specified time.");
    }

    // click search button
    await page.click('div:has( > svg[aria-label="Search"])');

    const searchInputSelector = 'input[aria-label="Search input"]';
    await page.waitForSelector(searchInputSelector, {
      visible: true,
      timeout: searchTimeout,
    });

    if (!(await page.$(searchInputSelector))) {
      throw new Error("Search input not found within the specified time.");
    }

    // select search input & type
    await page.type(searchInputSelector, username, {
      delay: 150,
    });

    //  Get profile image
    const profilePicSelector = `img[alt="${username}\'s profile picture"]`;
    await page.waitForSelector(profilePicSelector, {
      visible: true,
      timeout: searchTimeout,
    });

    if (!(await page.$(profilePicSelector))) {
      throw new Error("Profile picture not found within the specified time.");
    }

    const getProfilePicURL = await page.evaluate((username) => {
      // Get all the image elements on the page
      const image = document.querySelector(
        `img[alt="${username}\'s profile picture"]`
      );

      return image.src;
    }, username);

    await browser.close();

    return new Promise((resolve, reject) => {
      request(getProfilePicURL)
        .pipe(fs.createWriteStream("profile.jpg"))
        .on("close", () => {
          console.log("Image downloaded successfully!");
          resolve(true);
        })
        .on("error", (err) => {
          console.error("Error downloading the image:", err);
          reject(false);
        });
    });
  } catch (error) {
    console.log(error.message);
    await browser.close();
    return false;
  }
};
