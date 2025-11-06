//import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
window.onload = function () {
  const inputElement = document.querySelector(
    "._spectrum-Textfield-input_61339"
  );
  if (inputElement) {
    inputElement.style.height = "220px"; // ตั้งค่าความสูงเป็น 220px
  }
  const inputElementss = document.querySelector(".input--full.title-input");

  if (inputElementss) {
    inputElementss.style.height = "120px"; // ตั้งค่าความสูงเป็น 220px
  }
};

(async function () {
  let currentIndex = 0; // ตัวแปรเพื่อเก็บตำแหน่งของ element ที่จะถูกคลิก
  let isAutoClicking = false; // ตัวแปรเพื่อเช็คสถานะการทำงานของฟังก์ชัน
  let isChecked = false; // ตัวแปรเพื่อเก็บสถานะของ checkbox
  let isRarkKeywords = false; // ตัวแปรเก็บสถานะ
  let checkbox3Clicked = false; // ตัวแปรเก็บสถานะ
  let elements = [];
  let chacknext = false;
  let Category = true;
  let FileType = true;
  let hideCheckboxs = true;

  let CreatedbyAI = true;
  let Editorialcontent = false;
  let countdownInterval = null;
  let requestCounter = 0; // ตัวแปรเก็บจำนวนครั้งที่ทำการเรียก API
  Category = localStorage.getItem("Category") === "true" || false;
  FileType = localStorage.getItem("File Type") === "true" || false;
  CreatedbyAI = localStorage.getItem("Created by AI") === "true" || false;
  hideCheckboxs = localStorage.getItem("hideGeminiApiKey") === "true" || false;

  let storedKeyss = JSON.parse(
    localStorage.getItem("gemini_api_keysL") || "[]"
  );
  //let geminiInputs = storedKeyss[requestCounter % storedKeyss.length];

  //let genAI = new GoogleGenerativeAI(geminiInputs);

  // Function to fetch image and convert to Base64
  async function urlToBase64(url, mimeType) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return {
      inlineData: {
        data: base64String,
        mimeType,
      },
    };
  }

  async function urlToBase(url) {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return base64String; // return แค่ string ธรรมดา
  }

  console.log(Category);
  console.log(FileType);
  console.log(CreatedbyAI);

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const popupOverlay = document.createElement("div");
  popupOverlay.style.position = "fixed";
  popupOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.57)";
  popupOverlay.style.bottom = "0px";
  popupOverlay.style.right = "0px";
  popupOverlay.style.width = "100%";
  popupOverlay.style.height = "100%";
  popupOverlay.style.display = "none";
  popupOverlay.style.alignItems = "center";
  popupOverlay.style.justifyContent = "center";
  popupOverlay.style.zIndex = "10000";

  // สร้างคอนเทนเนอร์ภายใน popup สำหรับจัดวางองค์ประกอบ
  const popupContainer = document.createElement("div");
  popupContainer.style.backgroundColor = "#fff";
  popupContainer.style.margin = "auto";
  popupContainer.style.color = "black";
  popupContainer.style.borderRadius = "10px";
  popupContainer.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  popupContainer.style.display = "flex";
  popupContainer.style.flexDirection = "column";
  popupContainer.style.alignItems = "center";
  popupContainer.style.width = "420px";
  //popupContainer.style.maxHeight = "90%";
  popupContainer.style.textAlign = "center";
  popupContainer.style.position = "relative"; // เพิ่มการใช้ relative positioning เพื่ออ้างอิงตำแหน่งของปุ่ม
  popupContainer.style.padding = "20px"; // เพิ่ม padding ป้องกันเนื้อหาติดขอบ
  // สร้างรูปภาพจาก URL
  const imageUrl = "https://example.com/image.jpg"; // เปลี่ยนเป็น URL ของคุณ
  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = "Description of image"; // ใส่คำอธิบายรูปภาพ
  // ✅ จำกัดขนาดสูงสุดไม่เกิน 400px ทั้งกว้างและสูง พร้อมรักษาสัดส่วน
  image.style.maxWidth = "300px";
  image.style.maxHeight = "600px";
  image.style.minWidth = "300px"; // กำหนดความกว้างขั้นต่ำ

  image.style.width = "auto";
  image.style.height = "auto";
  image.style.borderRadius = "10px"; // มุมโค้ง

  // เพิ่มรูปภาพเข้า popupContainer
  popupContainer.appendChild(image);

  // สร้างอิลิเมนต์สำหรับการโหลด
  const loader = document.createElement("div");
  loader.style.display = "block";
  loader.style.border = "8px solid #f3f3f3"; // สีพื้นหลัง
  loader.style.borderTop = "8px solid rgb(0, 0, 0)"; // สีของการหมุน
  loader.style.borderRadius = "50%";
  loader.style.width = "50px"; // ขนาดของการหมุน
  loader.style.height = "50px"; // ขนาดของการหมุน
  loader.style.animation = "spin 1s linear infinite"; // การหมุน
  loader.style.margin = "20px auto"; // จัดตำแหน่งกลาง

  // เพิ่มการหมุนด้วย JavaScript
  loader.style.transform = "translateZ(0)"; // เร่งความเร็วการเรนเดอร์
  loader.style.display = "inline-block"; // ทำให้แสดงเป็นบล็อกในแนวนอน

  // สร้างคีย์เฟรมการหมุน
  const spinKeyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(spinKeyframes));
  document.head.appendChild(style);

  // เพิ่ม loader ในป๊อปอัป
  popupContainer.appendChild(loader);

  // เพิ่ม title
  const titles = document.createElement("p");
  titles.style.display = "none";
  titles.innerText = ""; // ใส่ชื่อเรื่องที่ต้องการ
  titles.style.margin = "10px 0"; // ตั้งค่าระยะห่างด้านบนและล่าง
  popupContainer.appendChild(titles);

  // เพิ่ม keywords
  const keywordss = document.createElement("p");
  keywordss.style.display = "none";
  keywordss.innerText = ""; // ใส่ keywords ที่ต้องการ
  keywordss.style.margin = "5px 0"; // ตั้งค่าระยะห่างด้านบนและล่าง
  popupContainer.appendChild(keywordss);

  const tokens = document.createElement("p");
  tokens.style.display = "none";
  tokens.innerText = ""; // ใส่ keywords ที่ต้องการ
  tokens.style.margin = "5px 0"; // ตั้งค่าระยะห่างด้านบนและล่าง
  popupContainer.appendChild(tokens);

  popupOverlay.appendChild(popupContainer);

  async function clickNextElement() {
    if (!isAutoClicking) return;

    if (currentIndex >= elements.length) {
      updateStatus("✅ All images have been created!", "rgb(255, 255, 255)");
      generateButton.style.display = "flex";
      buttonContainers.style.display = "inline-block";
      popupOverlay.style.display = "none";
      isAutoClicking = false;
      currentIndex = 0;
      autoButton.textContent = "Auto";
      autoButton.style.backgroundColor = "rgb(0, 0, 0)";

      // ค้นหาปุ่มตาม data-t attribute
      const submitButton = document.querySelector(
        'button[data-t="submit-moderation-button"]'
      );

      if (submitButton) {
        const buttonText = submitButton.textContent.trim(); // ดึงข้อความจากปุ่ม
        const numbers = buttonText.match(/\d+/g); // ค้นหาตัวเลขทั้งหมดในข้อความ
        console.log("ตัวเลขที่พบในปุ่ม:", numbers[0]);
        console.log("ตัวเลขที่พบในปุ่ม:", parseInt(numbers[0], 10));
        console.log("จำนวนตัวเลขที่พบ:", elements.length);
        const firstNumber = parseInt(numbers[0], 10); // ดึงตัวเลขแรกและแปลงเป็นตัวเลขจริง
        console.log("จำนวนตัวเลขที่พบ-------:", firstNumber);

        if (firstNumber != elements.length) {
          autoButton.click();
          console.log(" ✅ไม่พบตัวเลขในปุ่ม");
        } else {
          console.log("❌ ไม่พบตัวเลขในปุ่ม");

          if (autoSubmitCheckbox.checked === true) {
            for (let i = 0; i < 4; i++) {
              buttonCheckbox();
              await delay(3000);
            }
            clickSubmitButton();
          }
        }
      } else {
        console.log("❌ ไม่พบปุ่มที่ต้องการ");

        if (autoSubmitCheckbox.checked === true) {
          //  for (let i = 0; i < 4; i++) {
          buttonCheckbox();
          await delay(3000);
          // }

          clickSubmitButton();
        }
      }

      return;
    }

    const element = elements[currentIndex];
    element.click();
    console.log("URL ของรูปภาพที่ถูกคลิก:", element.src);
    // ค้นหา .mti-icon ภายใต้ .container-inline-block ที่ element อยู่
    const container = element.closest(".container-inline-block"); // หา container ของ element
    const icon = container?.querySelector(
      ".mti-icon.red.pastel-text.icon-radio-active.dot-size"
    );

    if (icon) {
      console.log("พบ icon ที่ต้องการ:", icon);

      if (Editorialcontent == true) {
        if (openAiRadio.checked) {
          await getChatGPTResponseGWS(element.src);
        } else {
          await generateContentFromImageGSW(element.src);
        }
      } else {
        if (openAiRadio.checked) {
          await getChatGPTResponse(element.src);
        } else {
          await generateContentFromImage(element.src);
        }
      }
      if (currentIndex === 0) {
        await delay(4000);
      }
    } else {
      image.style.display = "block";
      image.src = element.src;
      loader.style.display = "block";
      tokens.style.display = "none";
      titles.style.display = "none";
      keywordss.style.display = "none";
      titles.innerText = ``;
      keywordss.innerText = ``;
      console.log("ไม่พบ icon ที่ต้องการใน container:", container);
    }

    currentIndex++;
    updateStatus(
      `📸 Creating Title and Keywords.. ${currentIndex}/${elements.length}`,
      "#FFA500"
    );
    // เรียกฟังก์ชันอีกครั้งโดยไม่มีการหน่วงเวลา
    // clickNextElement();
    if (icon) {
      setTimeout(clickNextElement, 1000);
    } else {
      setTimeout(clickNextElement, 100);
    }
  }

  function updateStatus(text, color) {
    statusDiv.textContent = text;
    statusDiv.style.backgroundColor = color;
  }

  function updateStatusL(text, color) {
    statusDivL.textContent = text;
    statusDivL.style.backgroundColor = color;
  }
  // สร้าง container สำหรับปุ่ม
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "5px";
  buttonContainer.style.position = "fixed";
  buttonContainer.style.bottom = "24px";
  buttonContainer.style.left = "180px";
  buttonContainer.style.bottom = "22px";
  buttonContainer.style.zIndex = "1000000";

  // ปุ่ม Auto
  const autoButton = document.createElement("button");
  autoButton.textContent = "Auto";
  autoButton.title =
    "คลิกเพื่อเริ่มทำงานอัตโนมัติใส่ Title + Keywords และอื่นๆ ตามการตั้งค่า จนครบทุกภาพที่มีในหน้านี้\nClick to start the automatic process of filling Title + Keywords and other settings until all images on this page are processed.";
  autoButton.style.display = "flex";
  autoButton.style.alignItems = "center";
  autoButton.style.justifyContent = "center";
  autoButton.style.backgroundColor = "black";
  autoButton.style.color = "white";
  autoButton.style.border = "none";
  autoButton.style.borderRadius = "25px";
  autoButton.style.padding = "10px 20px";
  autoButton.style.fontSize = "16px";
  autoButton.style.fontWeight = "bold";
  autoButton.style.cursor = "pointer";
  autoButton.style.transition = "opacity 0.2s";
  autoButton.addEventListener("mouseenter", () => {
    autoButton.style.opacity = "0.8";
  });
  autoButton.addEventListener("mouseleave", () => {
    autoButton.style.opacity = "1";
  });

  // ปุ่ม Generate
  const generateButton = document.createElement("button");
  generateButton.textContent = "Generate";
  generateButton.title =
    "คลิกเพื่อเริ่มกระบวนการใส่ Title + Keywords และการตั้งค่าอื่นๆ ตามที่คุณกำหนดสำหรับภาพที่เลือกในขณะนี้\nClick to begin adding Title + Keywords, and other settings based on your configuration for the currently selected image.";
  generateButton.style.display = "flex";
  generateButton.style.alignItems = "center";
  generateButton.style.justifyContent = "center";
  generateButton.style.backgroundColor = "black";
  generateButton.style.color = "white";
  generateButton.style.border = "none";
  generateButton.style.borderRadius = "25px";
  generateButton.style.padding = "10px 20px";
  generateButton.style.fontSize = "16px";
  generateButton.style.fontWeight = "bold";
  generateButton.style.cursor = "pointer";
  generateButton.style.transition = "opacity 0.2s";
  generateButton.addEventListener("mouseenter", () => {
    generateButton.style.opacity = "0.8";
  });
  generateButton.addEventListener("mouseleave", () => {
    generateButton.style.opacity = "1";
  });

  // สร้าง container สำหรับปุ่ม
  const buttonContainers = document.createElement("div");
  buttonContainers.style.position = "relative";
  buttonContainers.style.display = "inline-block";

  // ปุ่ม Submit
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.title =
    "คลิกเพื่อส่งภาพอัตโนมัติตามขั้นตอนจนกระทั่งกระบวนการเสร็จสมบูรณ์\nClick to automatically submit images following the process until the procedure is completed.";
  submitButton.style.display = "flex";
  submitButton.style.height = "40px";
  submitButton.style.alignItems = "center";
  submitButton.style.justifyContent = "center";
  submitButton.style.backgroundColor = "black"; // สีฟ้า
  submitButton.style.color = "white";
  submitButton.style.border = "none";
  submitButton.style.borderRadius = "25px";
  submitButton.style.padding = "12px 24px";
  submitButton.style.fontSize = "16px";
  submitButton.style.fontWeight = "bold";
  submitButton.style.cursor = "pointer";
  submitButton.style.transition = "opacity 0.2s";
  submitButton.style.position = "relative";

  // ป้าย Beta
  const betaLabel = document.createElement("span");
  betaLabel.textContent = "Beta";
  betaLabel.style.position = "absolute";
  betaLabel.style.top = "0px";
  betaLabel.style.right = "0px";
  betaLabel.style.backgroundColor = "red";
  betaLabel.style.color = "white";
  betaLabel.style.fontSize = "10px";
  betaLabel.style.fontWeight = "bold";
  betaLabel.style.padding = "2px 5px";
  betaLabel.style.borderRadius = "5px";
  betaLabel.style.boxShadow = "0px 0px 4px rgba(0, 0, 0, 0.2)";

  // เพิ่มเอฟเฟกต์ hover
  submitButton.addEventListener("mouseenter", () => {
    submitButton.style.opacity = "0.8";
  });
  submitButton.addEventListener("mouseleave", () => {
    submitButton.style.opacity = "1";
  });

  // ใส่ปุ่มและป้าย Beta ลงใน container
  buttonContainers.appendChild(submitButton);
  buttonContainers.appendChild(betaLabel);

  // ปุ่มไอคอนเฟือง ⚙️
  const settingsButton = document.createElement("button");
  settingsButton.style.display = "flex";
  settingsButton.title = "ตั้งค่า\nSettings";
  settingsButton.style.alignItems = "center";
  settingsButton.style.justifyContent = "center";
  settingsButton.style.backgroundColor = "black";
  settingsButton.style.color = "white";
  settingsButton.style.border = "none";
  settingsButton.style.borderRadius = "50%"; // วงกลม
  settingsButton.style.width = "40px";
  settingsButton.style.height = "40px";
  settingsButton.style.cursor = "pointer";
  settingsButton.style.transition = "opacity 0.2s";
  settingsButton.addEventListener("mouseenter", () => {
    settingsButton.style.opacity = "0.8";
  });
  settingsButton.addEventListener("mouseleave", () => {
    settingsButton.style.opacity = "1";
  });

  // ไอคอนเฟือง (ใช้ Unicode)
  const settingsIcon = document.createElement("span");
  settingsIcon.innerHTML = "⚙️"; // ไอคอนเฟือง
  settingsIcon.style.fontSize = "18px";

  // ปุ่ม Buy a Coffee ☕
  const coffeeButton = document.createElement("button");
  coffeeButton.textContent = "🤝Support Us";
  coffeeButton.style.display = "flex";
  coffeeButton.style.alignItems = "center";
  coffeeButton.style.justifyContent = "center";
  coffeeButton.style.backgroundColor = "rgb(89, 0, 255)";
  coffeeButton.style.color = " rgb(255, 255, 255)";
  coffeeButton.style.border = "none";
  coffeeButton.style.borderRadius = "20px"; // ขอบมน
  coffeeButton.style.padding = "5px 10px";
  coffeeButton.style.fontSize = "16px";
  coffeeButton.style.height = "40px";
  coffeeButton.style.cursor = "pointer";
  coffeeButton.style.transition = "opacity 0.2s";

  coffeeButton.addEventListener("mouseenter", () => {
    coffeeButton.style.opacity = "0.8";
  });
  coffeeButton.addEventListener("mouseleave", () => {
    coffeeButton.style.opacity = "1";
  });

  // ลิงก์ไปยังหน้า Buy Me a Coffee
  //coffeeButton.addEventListener("click", () => {
  // window.open("https://buymeacoffee.com/tonchainarn", "_blank");
  //});
  let popups = null; // ตัวแปร global สำหรับ popup

  const createPopup = () => {
    if (popups) return; // ถ้ามีอยู่แล้วไม่ต้องสร้างใหม่
    // สร้าง popup
    popups = document.createElement("div");
    popups.style.display = "flex";
    popups.style.flexDirection = "column"; // วางองค์ประกอบในแนวตั้ง
    popups.style.position = "fixed";
    popups.style.bottom = "70px";
    popups.style.left = "380px";
    popups.style.backgroundColor = "white";
    popups.style.border = "1px solid #ccc";
    popups.style.borderRadius = "10px";
    popups.style.padding = "20px";
    popups.style.width = "350px"; // ปรับขนาดให้พอดี

    popups.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    popups.style.zIndex = "10000000000";
    popups.style.alignItems = "center";

    // ปุ่มปิด (x)
    const closeButton = document.createElement("button");
    closeButton.textContent = "x";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "10px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.color = "#333";
    closeButton.style.fontSize = "26px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
      document.body.removeChild(popups);
      popups = null;
    });

    // ข้อความแนะนำ
    const message = document.createElement("p");
    message.style.marginTop = "20px";
    message.textContent =
      "Hello everyone! If you're using the AGKeywords Plus extension, I'm the developer. Please support my coffee! Thank you for your support! ☕";
    message.style.fontSize = "14px";
    message.style.textAlign = "center";
    message.style.margin = "10px 0";

    // สร้าง container สำหรับปุ่ม
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between"; // จัดเรียงปุ่มในบรรทัดเดียวกัน
    buttonContainer.style.width = "100%";

    // ปุ่ม PromptPay
    const promptPayButton = document.createElement("button");
    const promptPayImage = document.createElement("img");
    promptPayImage.src = "https://img2.pic.in.th/pic/yellow-buttondfdf.png"; // ลิงก์ของภาพที่ต้องการใช้
    //promptPayImage.alt = "PromptPay";
    promptPayImage.style.width = "142px"; // ปรับขนาดให้พอดี
    promptPayImage.style.height = "40px"; // ปรับขนาดให้พอดี
    //promptPayButton.style.backgroundColor = "#4CAF50";
    promptPayButton.style.color = "white";
    //promptPayButton.style.padding = "12px 20px";
    //promptPayButton.style.margin = "5px";
    //promptPayButton.style.borderRadius = "25px";
    promptPayButton.style.fontSize = "16px";
    promptPayButton.style.cursor = "pointer";
    promptPayButton.style.transition = "all 0.3s ease";
    promptPayButton.appendChild(promptPayImage);
    promptPayButton.addEventListener("mouseenter", () => {
      promptPayButton.style.transform = "scale(1.05)";
    });
    promptPayButton.addEventListener("mouseleave", () => {
      promptPayButton.style.transform = "scale(1)";
    });
    promptPayButton.addEventListener("click", () => {
      window.open("https://buy.stripe.com/4gwdRn6Sr6pD2Z29AE", "_blank");
      document.body.removeChild(popups);
      popups = null;
    });

    // ปุ่ม Buy a Coffee
    const buyCoffeeButton = document.createElement("button");
    const promptPayImages = document.createElement("img");
    promptPayImages.src =
      "https://img5.pic.in.th/file/secure-sv1/yellow-button.png"; // ลิงก์ของภาพที่ต้องการใช้
    //promptPayImage.alt = "PromptPay";
    promptPayImages.style.width = "142px"; // ปรับขนาดให้พอดี
    promptPayImages.style.height = "40px"; // ปรับขนาดให้พอดี
    //buyCoffeeButton.textContent = "Buymeacoffee";
    //buyCoffeeButton.style.backgroundColor = "#FFDD57";
    buyCoffeeButton.style.color = "black";
    //buyCoffeeButton.style.padding = "12px 20px";
    //buyCoffeeButton.style.margin = "5px";
    //buyCoffeeButton.style.borderRadius = "25px";
    buyCoffeeButton.style.fontSize = "16px";
    buyCoffeeButton.style.cursor = "pointer";
    buyCoffeeButton.style.transition = "all 0.3s ease";
    buyCoffeeButton.appendChild(promptPayImages);
    buyCoffeeButton.addEventListener("mouseenter", () => {
      buyCoffeeButton.style.transform = "scale(1.05)";
    });
    buyCoffeeButton.addEventListener("mouseleave", () => {
      buyCoffeeButton.style.transform = "scale(1)";
    });
    buyCoffeeButton.addEventListener("click", () => {
      window.open("https://buymeacoffee.com/tonchainarn", "_blank");
      document.body.removeChild(popups);
      popups = null;
    });

    // เพิ่มปุ่มใน container

    buttonContainer.appendChild(promptPayButton);
    buttonContainer.appendChild(buyCoffeeButton);

    // เพิ่มองค์ประกอบทั้งหมดใน popup
    popups.appendChild(closeButton);
    popups.appendChild(message);
    popups.appendChild(buttonContainer);

    // ลิงก์ติดต่อ Contact Us
    const contactLink = document.createElement("a");
    contactLink.href = "https://www.facebook.com/AGGenerator"; // <-- แก้เป็นอีเมลที่ต้องการ
    contactLink.setAttribute("target", "_blank");
    contactLink.textContent = "Contact Us";
    contactLink.style.marginTop = "10px";
    contactLink.style.fontSize = "13px";
    contactLink.style.color = "rgb(89, 0, 255)";
    contactLink.style.textDecoration = "none";
    contactLink.style.cursor = "pointer";
    contactLink.addEventListener("mouseenter", () => {
      contactLink.style.textDecoration = "underline";
    });
    contactLink.addEventListener("mouseleave", () => {
      contactLink.style.textDecoration = "none";
    });
    contactLink.addEventListener("click", () => {
      // ปิด popup เมื่อคลิกที่ลิงก์
      document.body.removeChild(popups);
      popups = null;
    });

    popups.appendChild(contactLink);

    // เพิ่ม popup ไปยัง body
    document.body.appendChild(popups);
  };

  // เมื่อคลิกที่ coffeeButton ให้แสดง popup
  // Toggle เปิด-ปิด popup
  coffeeButton.addEventListener("click", () => {
    if (popups) {
      document.body.removeChild(popups);
      popups = null;
    } else {
      createPopup();
    }
  });

  // เพิ่มปุ่ม "Buy a Coffee" ลงในหน้า
  document.body.appendChild(coffeeButton);

  const statusDiv = document.createElement("div");
  statusDiv.style.position = "fixed";
  statusDiv.style.display = "none";
  statusDiv.style.bottom = "0px";
  statusDiv.style.right = "0px";
  statusDiv.style.padding = "10px";
  statusDiv.style.fontSize = "14px";
  statusDiv.style.backgroundColor = "#ddd";
  statusDiv.style.color = "black";
  statusDiv.style.borderRadius = "5px";

  statusDiv.style.zIndex = "999999";

  statusDiv.textContent = "⏳ Waiting for operation...";

  const statusDivL = document.createElement("div");
  statusDivL.style.position = "fixed";
  //statusDivL.style.display = "none";
  statusDivL.style.bottom = "40px";
  statusDivL.style.right = "0px";
  statusDivL.style.padding = "10px";
  statusDivL.style.fontSize = "14px";
  statusDivL.style.backgroundColor = " black";
  statusDivL.style.color = " rgb(255, 255, 255)";
  statusDivL.style.borderRadius = "5px";
  statusDivL.style.zIndex = "999999";

  statusDivL.textContent = `🔑 API Key ${storedKeyss.length}`;

  settingsButton.appendChild(settingsIcon);

  // ใส่ปุ่มลงใน container
  buttonContainer.appendChild(autoButton);
  buttonContainer.appendChild(generateButton);
  buttonContainer.appendChild(buttonContainers);
  buttonContainer.appendChild(settingsButton);
  buttonContainer.appendChild(coffeeButton);
  // เพิ่ม container ลงใน document
  document.body.appendChild(statusDiv);
  document.body.appendChild(statusDivL);
  document.body.appendChild(buttonContainer);
  document.body.appendChild(popupOverlay);

  autoButton.addEventListener("click", () => {
    elements = document.querySelectorAll(
      ".container-inline-block .upload-tile__wrapper img"
    );
    if (elements.length === 0) {
      alert("❌ No image found to process.");
      return;
    }

    if (isAutoClicking) {
      popupOverlay.style.display = "none";
      isAutoClicking = false;
      isChecked = false;
      autoButton.textContent = "Auto";
      autoButton.style.backgroundColor = "black";
      clearInterval(countdownInterval);
      updateStatus(
        `⏹️ Stopped working. ${currentIndex}/${elements.length}`,
        "#FF0000"
      );
      generateButton.style.display = "flex";
      buttonContainers.style.display = "inline-block";
    } else {
      const containerKeywords = document.querySelector("#keywords-container");
      if (containerKeywords) {
        isRarkKeywords = false;
        containerKeyword.remove();
      }
      currentIndex = 0;
      popupOverlay.style.display = "flex";
      statusDiv.style.display = "block";
      isAutoClicking = true;
      isChecked = true;
      clickNextElement();
      autoButton.textContent = "Stop";
      autoButton.style.backgroundColor = "#FF0000";
      clearInterval(countdownInterval);
      updateStatus("🚀 Starting work...", "#00BFFF");
      generateButton.style.display = "none";
      buttonContainers.style.display = "none";
    }
  });

  generateButton.addEventListener("click", async () => {
    const urlImg = document.querySelector(
      ".padding-bottom-small.overflow-hidden.truncate img"
    );

    popupOverlay.style.display = "flex";
    generateButton.textContent = "Gen Wait...";
    isChecked = true;
    clearInterval(countdownInterval);
    autoButton.style.display = "none";
    buttonContainers.style.display = "none";
    const containerKeywords = document.querySelector("#keywords-container");
    if (containerKeywords) {
      isRarkKeywords = false;
      containerKeyword.remove();
    }

    chacknext = true;
    if (Editorialcontent == true) {
      if (openAiRadio.checked) {
        await getChatGPTResponseGWS(urlImg.src);
      } else {
        await generateContentFromImageGSW(urlImg.src);
      }
    } else {
      if (openAiRadio.checked) {
        await getChatGPTResponse(urlImg.src);
      } else {
        await generateContentFromImage(urlImg.src);
      }
    }

    chacknext = false;
    popupOverlay.style.display = "none";
    isAutoClicking = false;
    generateButton.textContent = "Generate";

    autoButton.style.display = "flex";
    buttonContainers.style.display = "inline-block";
  });

  submitButton.addEventListener("click", async () => {
    //for (let i = 0; i < 1; i++) {

    const containerKeywords = document.querySelector("#keywords-container");
    if (containerKeywords) {
      isRarkKeywords = false;
      containerKeyword.remove();
    }

    chacknext = true;
    for (let i = 0; i < 4; i++) {
      buttonCheckbox();
      await delay(3000);
    }
    clickSubmitButton();
    chacknext = false;
  });

  settingsButton.addEventListener("click", async () => {
    popupOverlays.style.display = "flex";
    if (hideCheckbox.checked === true) {
      geminiInput.style.color = "transparent";
    } else {
      geminiInput.style.color = "black";
    }
  });

  async function getChatGPTResponse(userInput) {
    image.style.display = "block";
    image.src = userInput;
    loader.style.display = "block";
    titles.style.display = "none";
    tokens.style.display = "none";
    keywordss.style.display = "none";
    titles.innerText = ``;
    keywordss.innerText = ``;
    const apiKey = apiInput.value; // แทนที่ด้วย API Key ของคุณ (ควรเก็บ API Key ไว้ในที่ปลอดภัย เช่น environment variables)
    // ค้นหา element ที่มี class "text-sregular"
    let fileName = "";

    if (!apiInput.value) {
      alert("Please enter your OpenAI API Key");
      return;
    }

    const textElement = document.querySelector(
      '[data-t="asset-sidebar-footer"] .text-sregular'
    );
    if (textElement) {
      // ดึงข้อความทั้งหมดจาก element
      const fullText = textElement.textContent;
      // แยกข้อความหลัง "ชื่อเดิม: "
      const splitText =
        fullText.split("ชื่อเดิม: ")[1] ||
        fullText.split("ชื่อต้นฉบับ: ")[1] ||
        fullText.split("Former name: ")[1] ||
        fullText.split("name: ")[1] ||
        fullText.split("Original name(s): ")[1];
      const fileNames = splitText?.trim();
      // ตัดคำว่า "gigapixel" ออก

      if (fileNames) {
        if (imageAndFilenameCheckbox.checked === true) {
          fileName = fileNames.replace(/gigapixel/gi, "").trim();
          console.log(fileName); // แสดงผลชื่อไฟล์
        } else {
          fileName = "";
        }
      } else {
        console.log("Error: No matching filename found");
      }
    }
    let conceptC = "";
    if (conceptCheckbox.checked === true) {
      conceptC = `,Ensure that the concept words '${conceptInput.value}' are integrated into the title seamlessly.`;
    } else {
      conceptC = ``;
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectGpt.value,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Generate a title based on the main image context using a descriptive format: Action/Event, Subject, Location, Content Type, Environment, Viewpoint, and Concept for SEO. The title must be strictly ${titleMin.value}-${titleMax.value} characters long, including spaces. No exceptions. ${conceptC}
          
          Generate a 150-character description that concisely explains the image's story.  
          
          Extract 99 keywords (1-2 words each) relevant to the title:  
          - 70% must be SEO-friendly.  
          - 30% must be common words.  
          Clearly separate these two groups.  
          
          Identify 5 main subject phrases (1-2 words each) and prioritize their order in the title.  
          
          Use the concept '${fileName}' as a 30% reference for relevance.  
          
          Categorize the image based on the 'Adobe-Category' dataset.  
          Determine the file type based on the 'Adobe-File type' dataset.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      detail: "low",
                      url: `${userInput}`,
                    },
                  },
                ],
              },
              {
                role: "system",
                content: `Use the following datasets:  
      
      'Adobe-Category':  
      [{"id":1,"name":"Animals"},{"id":2,"name":"Architecture"},{"id":3,"name":"Business"},{"id":4,"name":"Drinks"},{"id":5,"name":"Nature"},{"id":6,"name":"Emotions"},{"id":7,"name":"Food"},{"id":8,"name":"Graphic"},{"id":9,"name":"Hobbies"},{"id":10,"name":"Industry"},{"id":11,"name":"Landscape"},{"id":12,"name":"Lifestyle"},{"id":13,"name":"People"},{"id":14,"name":"Plants"},{"id":15,"name":"Culture"},{"id":16,"name":"Science"},{"id":17,"name":"Social Issues"},{"id":18,"name":"Sports"},{"id":19,"name":"Technology"},{"id":20,"name":"Transport"},{"id":21,"name":"Travel"}]  
      
      'Adobe-File type':  
      [{"id":1,"name":"Photos"},{"id":2,"name":"Illustrations"}]  
      
      Ensure all responses:  
      - Are in English with correct spelling.  
      - Exclude brand names, trademarks, copyrighted terms, and specific commercial products.  
      - Follow this strict format:  
      
      title="..."  
      description="..."  
      main-subject-words=[...]  
      keywords=[...]  
      categoryId="id"  
      FileTypeId="id"  
      
      No additional text, symbols, or explanations should be included.`,
              },
            ],
            max_tokens: 4000,
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0].message.content) {
        throw new Error("API response missing expected content");
      }

      const content = data.choices[0].message.content;
      console.log(data.choices[0].message.content);
      const title =
        content.split('title="')[1]?.split('"')[0] || "No title found";
      let keywords =
        content.split("keywords=[")[1]?.split("]")[0] || "No keywords found";
      let mainsubjectwords =
        content.split("main-subject-words=[")[1]?.split("]")[0] ||
        "No main-subject-words found";
      const categoryId =
        content.split('categoryId="')[1]?.split('"')[0] ||
        "No categoryId found";
      const FileTypeId =
        content.split('FileTypeId="')[1]?.split('"')[0] ||
        "No FileTypeId found";

      // แยกคำเป็นอาร์เรย์
      let keywordsArrays = keywords
        .replace(/\n/g, "") // ลบ newlines ออก
        .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
        .filter(Boolean)
        .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่ “ ” และ " ด้วย '; // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
      let mainsubjectwordsArray = mainsubjectwords
        .replace(/\n/g, "") // ลบ newlines ออก
        .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
        .filter(Boolean)
        .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // ลบค่าที่ว่างออก
      let concept = [];
      if (conceptCheckbox.checked === true) {
        concept = conceptInput.value
          .replace(/\n/g, "") // ลบ newlines ออก
          .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
          .filter(Boolean)
          .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
      } else {
        concept = [];
      }

      // ลบคำก่อน ":" (ถ้ามี)
      const cleanedTitle = title.includes(":")
        ? title.split(":").slice(1).join(":").trim()
        : title;

      loader.style.display = "none";
      titles.style.display = "block";
      titles.innerText = `Title: ${cleanedTitle}`;
      let combinedWords;
      // ดึง keywords จาก API IMStocker และเรียงลำดับ
      console.log("keywordsArrays:", keywordsArrays);
      if (seoAutoRankingCheckbox.checked === true) {
        const sortedKeywords = await fetchKeywords(keywordsArrays);
        console.log("Sorted Keywords Response:", sortedKeywords);
        combinedWords = [
          ...new Set([...concept, ...mainsubjectwordsArray, ...sortedKeywords]),
        ];
      } else {
        combinedWords = [
          ...new Set([...concept, ...mainsubjectwordsArray, ...keywordsArrays]),
        ];
      }
      console.log("---**---combinedWords:", combinedWords);
      // รวม mainsubjectwords + sortedKeywords

      // โหลดคำต้องห้ามจากไฟล์ JSON
      const forbiddenWords = await fetch(
        "https://gist.githubusercontent.com/chainarong982/85530f65276380a6d4b4899aff40f46f/raw/145a7ec633f092cd1036e79c236a6ec8aaa358ab/forbidden_words.json"
      )
        .then((response) => response.json())
        .then((data) => data.forbiddenWords)
        .catch((error) => {
          console.error("Error loading forbidden words:", error);
          return [];
        });

      // กรองคำที่ต้องห้ามออกจาก keywords
      const filteredKeywords = combinedWords.filter(
        (keyword) => !forbiddenWords.includes(keyword.toLowerCase())
      );
      console.log("filteredKeywords:", filteredKeywords);
      let uniqueKeywords = [...new Set(filteredKeywords)];
      console.log("uniqueKeywords:", uniqueKeywords);
      // จำกัดจำนวนคำไม่เกิน maxKeywordsCount
      const maxKeywordsCount = keywordInput.value;
      if (uniqueKeywords.length > maxKeywordsCount) {
        keywords = uniqueKeywords.slice(0, maxKeywordsCount).join(", ");
      } else {
        keywords = uniqueKeywords.join(", ");
      }

      console.log("Title:", cleanedTitle);
      console.log("Keywords:", keywords);
      keywordss.style.display = "block";
      keywordss.innerText = `(${maxKeywordsCount})Keywords: ${keywords}`;
      tokens.style.display = "block";
      tokens.innerText = `Total Tokens Used: ${data.usage.total_tokens.toLocaleString()} token`;
      await getinput(cleanedTitle, keywords, categoryId, FileTypeId);
      return content.trim();
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
    }
  }
  //********************************************************************************
  async function getChatGPTResponseGWS(userInput) {
    image.style.display = "block";
    image.src = userInput;
    loader.style.display = "block";
    titles.style.display = "none";
    tokens.style.display = "none";
    keywordss.style.display = "none";
    titles.innerText = ``;
    keywordss.innerText = ``;
    const apiKey = apiInput.value; // แทนที่ด้วย API Key ของคุณ (ควรเก็บ API Key ไว้ในที่ปลอดภัย เช่น environment variables)
    // ค้นหา element ที่มี class "text-sregular"
    let fileName = "";

    if (!apiInput.value) {
      alert("Please enter your OpenAI API Key");
      return;
    }

    const textElement = document.querySelector(
      '[data-t="asset-sidebar-footer"] .text-sregular'
    );
    if (textElement) {
      // ดึงข้อความทั้งหมดจาก element
      const fullText = textElement.textContent;
      // แยกข้อความหลัง "ชื่อเดิม: "
      const splitText =
        fullText.split("ชื่อเดิม: ")[1] ||
        fullText.split("ชื่อต้นฉบับ: ")[1] ||
        fullText.split("Former name: ")[1] ||
        fullText.split("name: ")[1] ||
        fullText.split("Original name(s): ")[1];
      const fileNames = splitText?.trim();
      // ตัดคำว่า "gigapixel" ออก

      if (fileNames) {
        if (imageAndFilenameCheckbox.checked === true) {
          fileName = fileNames.replace(/gigapixel/gi, "").trim();
          console.log(fileName); // แสดงผลชื่อไฟล์
        } else {
          fileName = "";
        }
      } else {
        console.log("Error: No matching filename found");
      }
    }
    let conceptC = "";
    if (conceptCheckbox.checked === true) {
      conceptC = `,Ensure that the concept words '${conceptInput.value}' are integrated into the title seamlessly.`;
    } else {
      conceptC = ``;
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectGpt.value,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Generate a title based on the main image context using a descriptive format: Action/Event, Subject, Location, Content Type, Environment, Viewpoint, and Concept for SEO. The title must be strictly ${titleMin.value}-${titleMax.value} characters long, including spaces. No exceptions. ${conceptC}
          
          Generate a 150-character description that concisely explains the image's story.  
          
          Extract 99 single-word keywords relevant to the title:  
          - 70% must be SEO-friendly.  
          - 30% must be common words.  
          Clearly separate these two groups.  
          
          Identify 5 main subject phrases (1-2 words each) and prioritize their order in the title.  
          
          Use the concept '${fileName}' as a 30% reference for relevance.  
          
          Categorize the image based on the 'Adobe-Category' dataset.  
          Determine the file type based on the 'Adobe-File type' dataset.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      detail: "low",
                      url: `${userInput}`,
                    },
                  },
                ],
              },
              {
                role: "system",
                content: `Use the following datasets:  

'Adobe-Category':  
[{"id":1,"name":"Animals"},{"id":2,"name":"Architecture"},{"id":3,"name":"Business"},{"id":4,"name":"Drinks"},{"id":5,"name":"Nature"},{"id":6,"name":"Emotions"},{"id":7,"name":"Food"},{"id":8,"name":"Graphic"},{"id":9,"name":"Hobbies"},{"id":10,"name":"Industry"},{"id":11,"name":"Landscape"},{"id":12,"name":"Lifestyle"},{"id":13,"name":"People"},{"id":14,"name":"Plants"},{"id":15,"name":"Culture"},{"id":16,"name":"Science"},{"id":17,"name":"Social Issues"},{"id":18,"name":"Sports"},{"id":19,"name":"Technology"},{"id":20,"name":"Transport"},{"id":21,"name":"Travel"}]  

'Adobe-File type':  
[{"id":1,"name":"Photos"},{"id":2,"name":"Illustrations"}]  

Ensure all responses:  
- Are in English with correct spelling.  
- Must include references to logos, brand names, symbols, trademarks, copyrighted terms, and specific commercial products when visible (since this is Editorial content).  
- Follow this strict format:  

title="..."  
description="..."  
main-subject-words=[...]  
keywords=[...]  
categoryId="id"  
FileTypeId="id"  

No additional text, symbols, or explanations should be included.  `,
              },
            ],
            max_tokens: 4000,
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0].message.content) {
        throw new Error("API response missing expected content");
      }

      const content = data.choices[0].message.content;
      console.log(data.choices[0].message.content);
      const title =
        content.split('title="')[1]?.split('"')[0] || "No title found";
      let keywords =
        content.split("keywords=[")[1]?.split("]")[0] || "No keywords found";
      let mainsubjectwords =
        content.split("main-subject-words=[")[1]?.split("]")[0] ||
        "No main-subject-words found";
      const categoryId =
        content.split('categoryId="')[1]?.split('"')[0] ||
        "No categoryId found";
      const FileTypeId =
        content.split('FileTypeId="')[1]?.split('"')[0] ||
        "No FileTypeId found";

      // แยกคำเป็นอาร์เรย์
      let keywordsArrays = keywords
        .replace(/\n/g, "") // ลบ newlines ออก
        .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
        .filter(Boolean)
        .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่ “ ” และ " ด้วย '; // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
      let mainsubjectwordsArray = mainsubjectwords
        .replace(/\n/g, "") // ลบ newlines ออก
        .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
        .filter(Boolean)
        .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // ลบค่าที่ว่างออก
      let concept = [];
      if (conceptCheckbox.checked === true) {
        concept = conceptInput.value
          .replace(/\n/g, "") // ลบ newlines ออก
          .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
          .filter(Boolean)
          .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
      } else {
        concept = [];
      }

      // ลบคำก่อน ":" (ถ้ามี)
      const cleanedTitle = title.includes(":")
        ? title.split(":").slice(1).join(":").trim()
        : title;

      loader.style.display = "none";
      titles.style.display = "block";
      titles.innerText = `Title: ${cleanedTitle}`;
      let combinedWords;
      // ดึง keywords จาก API IMStocker และเรียงลำดับ
      console.log("keywordsArrays:", keywordsArrays);
      if (seoAutoRankingCheckbox.checked === true) {
        const sortedKeywords = await fetchKeywords(keywordsArrays);
        console.log("Sorted Keywords Response:", sortedKeywords);
        combinedWords = [
          ...new Set([...concept, ...mainsubjectwordsArray, ...sortedKeywords]),
        ];
      } else {
        combinedWords = [
          ...new Set([...concept, ...mainsubjectwordsArray, ...keywordsArrays]),
        ];
      }
      console.log("---**---combinedWords:", combinedWords);
      // รวม mainsubjectwords + sortedKeywords

      // จำกัดจำนวนคำไม่เกิน maxKeywordsCount
      const maxKeywordsCount = keywordInput.value;
      if (combinedWords.length > maxKeywordsCount) {
        keywords = combinedWords.slice(0, maxKeywordsCount).join(", ");
      } else {
        keywords = combinedWords.join(", ");
      }

      console.log("Title:", cleanedTitle);
      console.log("Keywords:", keywords);
      keywordss.style.display = "block";
      keywordss.innerText = `(${maxKeywordsCount})Keywords: ${keywords}`;
      tokens.style.display = "block";
      tokens.innerText = `Total Tokens Used: ${data.usage.total_tokens.toLocaleString()} token`;
      await getinput(cleanedTitle, keywords, categoryId, FileTypeId);
      return content.trim();
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
    }
  }
  //*****------------------------------------------------------------------- */

  async function fetchKeywords(keywordsArray) {
    console.log("keywordsArray_fetchKeywords-----------:", keywordsArray);
    const url = "https://api.imstocker.com/api/keyword/getKeywordsByTitles";

    const requestBody = {
      title_keywords: keywordsArray,
      target: "site",
      id_language: "1",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // 🔹 ตรวจสอบข้อมูลที่ได้จาก API
      console.log("API Response:", data);

      const keywordsData = data.res; // ดึงข้อมูลจาก res
      if (Array.isArray(keywordsData)) {
        const missingKeywords = keywordsArray.filter(
          (keyword) => !keywordsData.some((item) => item.keyword === keyword)
        );
        console.log("Missing Keywords:", missingKeywords);
      } else {
        console.error("Unexpected API response format:", data);
      }

      // ตรวจสอบว่า data มีฟิลด์ res ที่เป็นอาเรย์หรือไม่
      if (data.res && Array.isArray(data.res)) {
        // เรียงลำดับ keywords ตาม result_rank (มาก -> น้อย)
        data.res.sort((a, b) => b.result_rank - a.result_rank);

        // ดึงเฉพาะคำจาก API มาใช้งาน
        const sortedKeywords = data.res.map((k) => k.title_keyword);

        console.log("sortedKeywords_fetchKeywords:", sortedKeywords);

        return sortedKeywords;
      } else {
        console.error("Expected an array in 'res', but received:", data);
        return keywordsArray; // คืนค่าเดิมถ้าไม่พบฟิลด์ res ที่เป็นอาเรย์
      }
    } catch (error) {
      console.error("Error fetching keywords:", error);
      return keywordsArray; // คืนค่าเดิมถ้า API ล้มเหลว
    }
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function generateContentFromImage(userInput) {
    image.style.display = "block";
    image.src = userInput;
    loader.style.display = "block";
    titles.style.display = "none";
    tokens.style.display = "none";
    keywordss.style.display = "none";
    titles.innerText = ``;
    keywordss.innerText = ``;

    let fileName = "";

    if (!geminiInput.value) {
      alert("Please enter your Gemini API Key");
      return;
    }
    const textElement = document.querySelector(
      '[data-t="asset-sidebar-footer"] .text-sregular'
    );
    if (textElement) {
      // ดึงข้อความทั้งหมดจาก element
      const fullText = textElement.textContent;
      // แยกข้อความหลัง "ชื่อเดิม: "
      const splitText =
        fullText.split("ชื่อเดิม: ")[1] ||
        fullText.split("Original name(s): ")[1];
      const fileNames = splitText?.trim();
      // ตัดคำว่า "gigapixel" ออก
      if (imageAndFilenameCheckbox.checked === true) {
        fileName = fileNames.replace(/gigapixel/gi, "").trim();
        console.log(fileName); // แสดงผลชื่อไฟล์
      } else {
        fileName = "";
      }
    }

    let conceptC = "";
    if (conceptCheckbox.checked === true) {
      conceptC = `,and ensures that the title includes the concept words '${conceptInput.value}' and`;
    } else {
      conceptC = `and`;
    }

    let models = [];
    if (select.value === "Automatic Model Selection") {
      models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
      ];
    } else {
      models = [select.value];
    }

    const shuffledModels = shuffleArray(models); // สุ่ม model ใหม่

    storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
    let attempts = 0;
    const maxAttempts = storedKeyss.length * models.length;
    let lastError = null;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const keyIndex = attempts % storedKeyss.length;
      const modelIndex =
        Math.floor(attempts / storedKeyss.length) % shuffledModels.length;

      const currentApiKey = storedKeyss[keyIndex];
      const currentModel = shuffledModels[modelIndex];
      //const currentModel = models[modelIndex];
      console.log(
        `🔑 Attempt ${attempts + 1}/${maxAttempts} - Using Key ${
          keyIndex + 1
        }/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`
      );

      updateStatusL(
        `🔑 Using API Key ${keyIndex + 1}/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`,
        "rgb(0, 0, 0)"
      );

      try {
        const ai = new GoogleGenAI({ apiKey: currentApiKey });

        // สมมติ userInput เป็น URL หรือ base64 ที่แปลงมาแล้ว
        // ถ้าเป็น URL ต้องแปลงเป็น base64 ก่อน (ฟังก์ชันนี้ต้องเขียนเพิ่มเอง)
        const imagePart = await urlToBase(userInput);

        // สร้างข้อความ systemInstruction
        const systemInstructionText = `Generate title and description from the image context. Format strictly as follows:
    title:"..."    
    main-subject-words:[...]
    keywords:[...]
    ThisIsAnIcon:"single-icon" | "multi-icon" | "not-icon"
    categoryId:"id" (Use '1.Adobe-Category' dataset: [{"id":1,"name":"Animals"},{"id":2,"name":"Architecture"},{"id":3,"name":"Business"},{"id":4,"name":"Drinks"},{"id":5,"name":"Nature"},{"id":6,"name":"Emotions"},{"id":7,"name":"Food"},{"id":8,"name":"Graphic"},{"id":9,"name":"Hobbies"},{"id":10,"name":"Industry"},{"id":11,"name":"Landscape"},{"id":12,"name":"Lifestyle"},{"id":13,"name":"People"},{"id":14,"name":"Plants"},{"id":15,"name":"Culture"},{"id":16,"name":"Science"},{"id":17,"name":"Social Issues"},{"id":18,"name":"Sports"},{"id":19,"name":"Technology"},{"id":20,"name":"Transport"},{"id":21,"name":"Travel"}])
    fileTypeId:"id" (Reference '1.Adobe-File type' dataset: [{"id":1,"name":"Photos"},{"id":2,"name":"Illustrations"}])`;
        const promptText = `Ensure title is between ${titleMin.value}-${titleMax.value} characters ${conceptC} contains no image headings whatsoever. main-subject-words 5 phrases (1-2 words each) and generate 90 keywords. using 1-2 word phrases most relevant to the results of the title 70% are SEO-friendly and 30% are common words. Split the output into two groups clearly sort priority of title use concept "${fileName}" as 30% reference and excludes any copyrighted terms Generate only english contain only correctly spelled words with SEO exclude any brand names, trademarks, copyrighted terms, genericized trademark, or specific commercial products. Please respond strictly in the following format, without any additional text or symbols`;
        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imagePart, // base64 string
                  mimeType: "image/png",
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ];

        const config = {
          maxOutputTokens: 4000,
          // temperature: 0.8,
          // topP: 0.95,
          systemInstruction: [{ text: systemInstructionText }],
        };

        if (currentModel != "gemini-1.5-flash") {
          config.mediaResolution = "MEDIA_RESOLUTION_LOW";
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          config,
          contents,
        });
        console.log(response.text);
        // ดึงผลลัพธ์ข้อความ
        const text = response.text ?? "No response";

        // 🔥 ดึงจำนวนโทเค็นที่ใช้ไป
        const tokenUsage = response.usageMetadata?.totalTokenCount ?? "";
        // Log the raw text response
        console.log("tokenUsage:", tokenUsage);
        console.log(text);

        // Clean the text to remove non-JSON parts and leave only the JSON object
        let cleanedText = text
          .replace(/```json/g, "") // Remove the opening markdown for JSON
          .replace(/```/g, "") // Remove the closing markdown for JSON
          //  .replace(/title="[^"]*"/g, "") // Remove the title
          // .replace(/description="[^"]*"/g, "") // Remove the description
          //.replace(/main-subject-words=\[.*?\]/g, "") // Remove main-subject-words
          //.replace(/keywords=\[.*?\]/g, "") // Remove keywords
          //.replace(/categoryId="\d+"/g, "") // Remove categoryId
          //.replace(/fileTypeId="\d+"/g, "") // Remove fileTypeId
          .replace(/\{\s*"title":\s*"/, 'title="')
          .replace(/",\s*"description":\s*"/, '"\ndescription="')
          .replace(/",\s*"main-subject-words":\s*\[/, '"\nmain-subject-words=[')
          .replace(/],\s*"keywords":\s*\[/, "]\nkeywords=[")
          .replace(/],\s*"categoryId":\s*"/, ']\ncategoryId="')
          .replace(/",\s*"fileTypeId":\s*"/, '"\nfileTypeId="')
          .replace(/"}$/, '"')
          .trim(); // Trim any surrounding whitespace

        // Log the cleaned text to debug
        console.log("Cleaned Text:", cleanedText);

        /*const title =
          cleanedText.split('title:"')[1]?.split('"')[0] ||
          cleanedText.split('title="')[1]?.split('"')[0] ||
          cleanedText.split('title= "')[1]?.split('"')[0] ||
          cleanedText.split('title:" ')[1]?.split('"')[0] ||
          cleanedText.split('title: "')[1]?.split('"')[0] ||
          "";
*/
        const match = cleanedText.match(
          /title\s*[:=]\s*(?:['"])?\s*(.+?)(?:['"])?\s*$/im
        );
        console.log("Match:", match);
        const title = match ? match[1].trim() : "";

        let keywords =
          cleanedText.split("keywords:[")[1]?.split("]")[0] ||
          cleanedText.split("keywords=[")[1]?.split("]")[0] ||
          "" ||
          cleanedText.split("keywords: [")[1]?.split("]")[0] ||
          cleanedText.split("keywords= [")[1]?.split("]")[0];
        let mainsubjectwords =
          cleanedText.split("main-subject-words:[")[1]?.split("]")[0] ||
          cleanedText.split("main-subject-words=[")[1]?.split("]")[0] ||
          "" ||
          cleanedText.split("main-subject-words: [")[1]?.split("]")[0] ||
          cleanedText.split("main-subject-words= [")[1]?.split("]")[0];

        let iconMatch = cleanedText.match(/ThisIsAnIcon[:=]\s*"?([\w-]+)"?/);
        let ThisIsAnIcon = iconMatch ? iconMatch[1] : "";

        let matchCategory = cleanedText.match(/categoryId[:=]\s*"?(\d+)"?/);
        let categoryId = matchCategory ? matchCategory[1] : "";

        let matchFile = cleanedText.match(/fileTypeId[:=]\s*"?(\d+)"?/);
        let FileTypeId = matchFile ? matchFile[1] : "";

        console.log("----------" + categoryId);

        loader.style.display = "none";
        titles.style.display = "block";

        console.log("mainsTitle:", title);
        console.log("ThisIsAnIcon:", ThisIsAnIcon);

        /*   newTitle;
        if (conceptCheckbox.checked === false) {

          if (title.includes(":")) {
  // มี ":" → เอาส่วนหลัง
              //newTitle = title.split(":").slice(1).join(":").trim();

        } else {
  // ไม่มี ":" → เอาเต็ม ๆ
              newTitle = title.trim();
        }
        }else {
           
        }*/
        const cleanBase = title.replace(/([_.])[^_.]*$/, ""); // ตัดทิ้งหลัง _ หรือ .
        let newTitle = cleanBase.replace(/:/g, "");
        titles.innerText = `Title: ${newTitle}`;

        keywords = keywords.replace(/['"]/g, "");
        mainsubjectwords = mainsubjectwords.replace(/['"]/g, "");
        // keywords = keywords
        // แปลงคีย์เวิร์ดเป็นอาเรย์
        console.log(" main-keywords:", mainsubjectwords);
        console.log("  keywords:", keywords);
        // 🔹 ใช้ regex เพื่อแยกคีย์เวิร์ดทั้งที่มี "," หรือ " " (รองรับทั้งสองแบบ)
        let keywordsArrayx = keywords
          .split(/[\s,]+/) // แยกด้วย space หรือ comma
          .map((keyword) => keyword.trim()) // ตัดช่องว่างที่เกิน
          .filter(Boolean); // ลบค่าที่เป็นค่าว่างออก

        console.log("Keywords Array:", keywordsArrayx);

        let concept = [];
        if (conceptCheckbox.checked === true) {
          concept = conceptInput.value
            .replace(/\n/g, "") // ลบ newlines ออก
            .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
            .filter(Boolean)
            .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
        } else {
          concept = [];
        }
        //let keywordsArrays = keywords.split(", ").filter(Boolean);
        const sortedKeywords = await fetchKeywords(keywordsArrayx);

        console.log("Sorted Keywords Response:", sortedKeywords);

        // รวม mainsubjectwords + sortedKeywords
        let combinedWords = [
          ...new Set([
            ...concept,
            ...mainsubjectwords
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean), // keep phrases
            ...sortedKeywords,
          ]),
        ];

        console.log("combinedWords:", combinedWords);
        // โหลดคำต้องห้ามจากไฟล์ JSON (สมมุติว่าเป็นลิงก์หรือ path ที่เข้าถึงได้)
        const forbiddenWords = await fetch(
          "https://gist.githubusercontent.com/chainarong982/85530f65276380a6d4b4899aff40f46f/raw/145a7ec633f092cd1036e79c236a6ec8aaa358ab/forbidden_words.json"
        )
          .then((response) => response.json())
          .then((data) => data.forbiddenWords)
          .catch((error) => {
            console.error("Error loading forbidden words:", error);
            return [];
          });

        // กรองคำที่ต้องห้ามออกจาก keywords

        const filteredKeywords = combinedWords.filter(
          (keyword) => !forbiddenWords.includes(keyword.toLowerCase())
        );
        console.log("filteredKeywords:", filteredKeywords);
        // การจำกัดจำนวนคำใน keywords (กำหนดให้ไม่เกิน 20 คำ)
        let uniqueKeywords = [...new Set(filteredKeywords)];

        const maxKeywordsCount = keywordInput.value; // จำนวนคำสูงสุดที่ต้องการ
        if (uniqueKeywords.length > maxKeywordsCount) {
          keywords = uniqueKeywords
            .slice(0, maxKeywordsCount)
            .join(", ")
            .replace(/[“”"]/g, "");
        } else {
          keywords = uniqueKeywords.join(", ").replace(/[“”"]/g, "");
        }

        let newkeywords = keywords.replace(/[^a-zA-Z0-9, ]/g, "");
        console.log("🏷 **Title:**", newTitle);
        console.log("🔍 **Main Subject Words:**", mainsubjectwords);
        console.log("🔑 **Filtered Keywords (30):**" + keywords);
        console.log("🔍 **ThisIsAnIcon:", ThisIsAnIcon);
        console.log("🔍 **Category ID:**", categoryId);
        console.log("🔍 **File Type ID:**", FileTypeId);

        keywordss.style.display = "block";
        keywordss.innerText = `(${maxKeywordsCount})Keywords: ${newkeywords}`;
        tokens.style.display = "block";
        tokens.innerText = `Total Tokens Used: ${tokenUsage.toLocaleString()} token`;

        await getinput(newTitle, newkeywords, categoryId, FileTypeId);
        clearInterval(countdownInterval);
        success = true;
        // ⬅️ ปิดการทำงานอัตโนมัติ
        //  console.log("✅ Success generateContent:", JSON.stringify(result, null, 2));
        await delay(1000); // รอ 1 วินาทีก่อนจะทำงานต่อ
        // return result;
      } catch (error) {
        console.error("❌ Caught error object:", error);
        if (
          error.message.includes("429") ||
          error.message.includes("You exceeded your current quota") ||
          error.message.includes("current quota")
        ) {
          console.warn(
            `⚠️ Quota exceeded for this key. Rotating to the next key...`
          );
          attempts++;
          requestCounter++;
          lastError = error;
          await delay(timeoutInput.value * 1000); // รอ 1 วินาทีก่อนลองคีย์ถัดไป
          if (!isChecked && autoButton.textContent == "Auto") return; // ⬅️ เพิ่มหลัง await ทันที
        } else {
          if (!isChecked && autoButton.textContent == "Auto") return; // ⬅️ เพิ่มหลัง await ทันที
          // ถ้า error อื่น โยนกลับทันที
          //  console.error(`❌ Non-quota error, stopping retry: ${error.message}`);
          //throw error; // ⬅️ โยนกลับทันที หยุด loop
        }
      }
    }
    if (!success) {
      showAutoCloseAlert(
        `⚠️ API Keys and models exhausted and paused to be available again in ${delayInput.value} minutes.`
      );
      console.error("All API Keys exhausted.");
      if (autoButton.textContent == "Stop") {
        console.log("-----------------");
        let countdown = 0;
        let countdowns = 0; // จำนวนวินาทีที่ต้องการรอ
        countdowns = delayInput.value * 60 * 1000; // แปลงนาทีเป็นมิลลิวินาที
        countdown = delayInput.value * 60; // แปลงวินาทีเป็นนาที
        // ฟังก์ชันสำหรับอัพเดตสถานะพร้อมนับเวลาถอยหลัง
        countdownInterval = setInterval(() => {
          updateStatus(
            `⏳ Retrying in ${countdown} seconds...`,
            "rgb(209, 153, 247)"
          );
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        // รอ 20 วินาทีแบบ async
        await delay(countdowns);

        clearInterval(countdownInterval);

        updateStatus("🚀 Starting work...", "#00BFFF");
      }
    }
  }
  //---------------------------------------------------------------------
  async function generateContentFromImageGSW(userInput) {
    image.style.display = "block";
    image.src = userInput;
    loader.style.display = "block";
    titles.style.display = "none";
    tokens.style.display = "none";
    keywordss.style.display = "none";
    titles.innerText = ``;
    keywordss.innerText = ``;

    let fileName = "";

    if (!geminiInput.value) {
      alert("Please enter your Gemini API Key");
      return;
    }
    const textElement = document.querySelector(
      '[data-t="asset-sidebar-footer"] .text-sregular'
    );
    if (textElement) {
      // ดึงข้อความทั้งหมดจาก element
      const fullText = textElement.textContent;
      // แยกข้อความหลัง "ชื่อเดิม: "
      const splitText =
        fullText.split("ชื่อเดิม: ")[1] ||
        fullText.split("Original name(s): ")[1];
      const fileNames = splitText?.trim();
      // ตัดคำว่า "gigapixel" ออก
      if (imageAndFilenameCheckbox.checked === true) {
        fileName = fileNames.replace(/gigapixel/gi, "").trim();
        console.log(fileName); // แสดงผลชื่อไฟล์
      } else {
        fileName = "";
      }
    }

    let conceptC = "";
    if (conceptCheckbox.checked === true) {
      conceptC = `,and ensures that the title includes the concept words '${conceptInput.value}' and`;
    } else {
      conceptC = `and`;
    }

    let models = [];
    if (select.value === "Automatic Model Selection") {
      models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
      ];
    } else {
      models = [select.value];
    }

    const shuffledModels = shuffleArray(models); // สุ่ม model ใหม่

    storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
    let attempts = 0;
    const maxAttempts = storedKeyss.length * models.length;
    let lastError = null;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const keyIndex = attempts % storedKeyss.length;
      const modelIndex =
        Math.floor(attempts / storedKeyss.length) % shuffledModels.length;

      const currentApiKey = storedKeyss[keyIndex];
      const currentModel = shuffledModels[modelIndex];
      //const currentModel = models[modelIndex];
      console.log(
        `🔑 Attempt ${attempts + 1}/${maxAttempts} - Using Key ${
          keyIndex + 1
        }/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`
      );

      updateStatusL(
        `🔑 Using API Key ${keyIndex + 1}/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`,
        "rgb(0, 0, 0)"
      );

      try {
        const ai = new GoogleGenAI({ apiKey: currentApiKey });

        // สมมติ userInput เป็น URL หรือ base64 ที่แปลงมาแล้ว
        // ถ้าเป็น URL ต้องแปลงเป็น base64 ก่อน (ฟังก์ชันนี้ต้องเขียนเพิ่มเอง)
        const imagePart = await urlToBase(userInput);

        // สร้างข้อความ systemInstruction
        const systemInstructionText = `Generate title and description from the image context. Format strictly as follows:
    title:"..."    
    main-subject-words:[...]
    keywords:[...]
    ThisIsAnIcon:"single-icon" | "multi-icon" | "not-icon"
    categoryId:"id" (Use '1.Adobe-Category' dataset: [{"id":1,"name":"Animals"},{"id":2,"name":"Architecture"},{"id":3,"name":"Business"},{"id":4,"name":"Drinks"},{"id":5,"name":"Nature"},{"id":6,"name":"Emotions"},{"id":7,"name":"Food"},{"id":8,"name":"Graphic"},{"id":9,"name":"Hobbies"},{"id":10,"name":"Industry"},{"id":11,"name":"Landscape"},{"id":12,"name":"Lifestyle"},{"id":13,"name":"People"},{"id":14,"name":"Plants"},{"id":15,"name":"Culture"},{"id":16,"name":"Science"},{"id":17,"name":"Social Issues"},{"id":18,"name":"Sports"},{"id":19,"name":"Technology"},{"id":20,"name":"Transport"},{"id":21,"name":"Travel"}])
    fileTypeId:"id" (Reference '1.Adobe-File type' dataset: [{"id":1,"name":"Photos"},{"id":2,"name":"Illustrations"}])`;
       const promptText = `Ensure title is between ${titleMin.value}-${titleMax.value} characters for EDITORIAL USE ONLY. This is editorial content: keep real-world logos, brand names, symbols, trademarks, copyrighted/proprietary terms, and specific commercial products exactly as they appear; do not remove, obscure, or alter them. Do not include image headings.
main-subject-words 5 phrases (1-2 words each) and generate 90 keywords using 1-2 word phrases most relevant to the title; 70% must be SEO-friendly and 30% common words. If any logos, brand names, trademarks, copyrighted terms, or specific commercial products are visible in ${conceptC}, include their exact names among the keywords (factual, non-promotional, no inventions). If none are visible, do not add any such terms.
Split the output into two groups and clearly sort by priority of title. Use concept "${fileName}" as 30% reference.
Generate only English, with correctly spelled words and SEO-aware phrasing. Please respond strictly in the following format, without any additional text or symbols`;

        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imagePart, // base64 string
                  mimeType: "image/png",
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ];

        const config = {
          maxOutputTokens: 4000,
          // temperature: 0.8,
          // topP: 0.95,
          systemInstruction: [{ text: systemInstructionText }],
        };

        if (currentModel != "gemini-2.0-flash") {
          config.mediaResolution = "MEDIA_RESOLUTION_LOW";
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          config,
          contents,
        });
        console.log(response.text);
        // ดึงผลลัพธ์ข้อความ
        const text = response.text ?? "No response";

        // 🔥 ดึงจำนวนโทเค็นที่ใช้ไป
        const tokenUsage = response.usageMetadata?.totalTokenCount ?? "";
        // Log the raw text response
        console.log("tokenUsage:", tokenUsage);
        console.log(text);

        // Clean the text to remove non-JSON parts and leave only the JSON object
        let cleanedText = text
          .replace(/```json/g, "") // Remove the opening markdown for JSON
          .replace(/```/g, "") // Remove the closing markdown for JSON
          //  .replace(/title="[^"]*"/g, "") // Remove the title
          // .replace(/description="[^"]*"/g, "") // Remove the description
          //.replace(/main-subject-words=\[.*?\]/g, "") // Remove main-subject-words
          //.replace(/keywords=\[.*?\]/g, "") // Remove keywords
          //.replace(/categoryId="\d+"/g, "") // Remove categoryId
          //.replace(/fileTypeId="\d+"/g, "") // Remove fileTypeId
          .replace(/\{\s*"title":\s*"/, 'title="')
          .replace(/",\s*"description":\s*"/, '"\ndescription="')
          .replace(/",\s*"main-subject-words":\s*\[/, '"\nmain-subject-words=[')
          .replace(/],\s*"keywords":\s*\[/, "]\nkeywords=[")
          .replace(/],\s*"categoryId":\s*"/, ']\ncategoryId="')
          .replace(/",\s*"fileTypeId":\s*"/, '"\nfileTypeId="')
          .replace(/"}$/, '"')
          .trim(); // Trim any surrounding whitespace

        // Log the cleaned text to debug
        console.log("Cleaned Text:", cleanedText);

        /*const title =
          cleanedText.split('title:"')[1]?.split('"')[0] ||
          cleanedText.split('title="')[1]?.split('"')[0] ||
          cleanedText.split('title= "')[1]?.split('"')[0] ||
          cleanedText.split('title:" ')[1]?.split('"')[0] ||
          cleanedText.split('title: "')[1]?.split('"')[0] ||
          "";
*/
        const match = cleanedText.match(
          /title\s*[:=]\s*(?:['"])?\s*(.+?)(?:['"])?\s*$/im
        );
        console.log("Match:", match);
        const title = match ? match[1].trim() : "";

        let keywords =
          cleanedText.split("keywords:[")[1]?.split("]")[0] ||
          cleanedText.split("keywords=[")[1]?.split("]")[0] ||
          "" ||
          cleanedText.split("keywords: [")[1]?.split("]")[0] ||
          cleanedText.split("keywords= [")[1]?.split("]")[0];
        let mainsubjectwords =
          cleanedText.split("main-subject-words:[")[1]?.split("]")[0] ||
          cleanedText.split("main-subject-words=[")[1]?.split("]")[0] ||
          "" ||
          cleanedText.split("main-subject-words: [")[1]?.split("]")[0] ||
          cleanedText.split("main-subject-words= [")[1]?.split("]")[0];

        let iconMatch = cleanedText.match(/ThisIsAnIcon[:=]\s*"?([\w-]+)"?/);
        let ThisIsAnIcon = iconMatch ? iconMatch[1] : "";

        let matchCategory = cleanedText.match(/categoryId[:=]\s*"?(\d+)"?/);
        let categoryId = matchCategory ? matchCategory[1] : "";

        let matchFile = cleanedText.match(/fileTypeId[:=]\s*"?(\d+)"?/);
        let FileTypeId = matchFile ? matchFile[1] : "";

        console.log("----------" + categoryId);

        loader.style.display = "none";
        titles.style.display = "block";

        console.log("mainsTitle:", title);
        console.log("ThisIsAnIcon:", ThisIsAnIcon);

        /*   newTitle;
        if (conceptCheckbox.checked === false) {

          if (title.includes(":")) {
  // มี ":" → เอาส่วนหลัง
              //newTitle = title.split(":").slice(1).join(":").trim();

        } else {
  // ไม่มี ":" → เอาเต็ม ๆ
              newTitle = title.trim();
        }
        }else {
           
        }*/
        const cleanBase = title.replace(/([_.])[^_.]*$/, ""); // ตัดทิ้งหลัง _ หรือ .
        let newTitle = cleanBase.replace(/:/g, "");
        titles.innerText = `Title: ${newTitle}`;

        keywords = keywords.replace(/['"]/g, "");
        mainsubjectwords = mainsubjectwords.replace(/['"]/g, "");
        // keywords = keywords
        // แปลงคีย์เวิร์ดเป็นอาเรย์
        console.log(" main-keywords:", mainsubjectwords);
        console.log("  keywords:", keywords);
        // 🔹 ใช้ regex เพื่อแยกคีย์เวิร์ดทั้งที่มี "," หรือ " " (รองรับทั้งสองแบบ)
        let keywordsArrayx = keywords
          .split(/[\s,]+/) // แยกด้วย space หรือ comma
          .map((keyword) => keyword.trim()) // ตัดช่องว่างที่เกิน
          .filter(Boolean); // ลบค่าที่เป็นค่าว่างออก

        console.log("Keywords Array:", keywordsArrayx);

        let concept = [];
        if (conceptCheckbox.checked === true) {
          concept = conceptInput.value
            .replace(/\n/g, "") // ลบ newlines ออก
            .split(/\s*,\s*/) // แยกคำโดยไม่สนช่องว่างรอบ ","
            .filter(Boolean)
            .map((keyword) => keyword.replace(/[“”"]/g, "").toLowerCase()); // แทนที่เครื่องหมาย “”; // ลบค่าที่ว่างออก
        } else {
          concept = [];
        }
        //let keywordsArrays = keywords.split(", ").filter(Boolean);
        const sortedKeywords = await fetchKeywords(keywordsArrayx);

        console.log("Sorted Keywords Response:", sortedKeywords);

        // รวม mainsubjectwords + sortedKeywords
        let combinedWords = [
          ...new Set([
            ...concept,
            ...mainsubjectwords
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean), // keep phrases
            ...sortedKeywords,
          ]),
        ];

        console.log("combinedWords:", combinedWords);
        // โหลดคำต้องห้ามจากไฟล์ JSON (สมมุติว่าเป็นลิงก์หรือ path ที่เข้าถึงได้)

        const maxKeywordsCount = keywordInput.value; // จำนวนคำสูงสุดที่ต้องการ
        if (combinedWords.length > maxKeywordsCount) {
          keywords = combinedWords
            .slice(0, maxKeywordsCount)
            .join(", ")
            .replace(/[“”"]/g, "");
        } else {
          keywords = combinedWords.join(", ").replace(/[“”"]/g, "");
        }

        let newkeywords = keywords.replace(/[^a-zA-Z0-9, ]/g, "");
        console.log("🏷 **Title:**", newTitle);
        console.log("🔍 **Main Subject Words:**", mainsubjectwords);
        console.log("🔑 **Filtered Keywords (30):**" + keywords);
        console.log("🔍 **ThisIsAnIcon:", ThisIsAnIcon);
        console.log("🔍 **Category ID:**", categoryId);
        console.log("🔍 **File Type ID:**", FileTypeId);

        keywordss.style.display = "block";
        keywordss.innerText = `(${maxKeywordsCount})Keywords: ${newkeywords}`;
        tokens.style.display = "block";
        tokens.innerText = `Total Tokens Used: ${tokenUsage.toLocaleString()} token`;

        await getinput(newTitle, newkeywords, categoryId, FileTypeId);
        clearInterval(countdownInterval);
        success = true;
        // ⬅️ ปิดการทำงานอัตโนมัติ
        //  console.log("✅ Success generateContent:", JSON.stringify(result, null, 2));
        await delay(1000); // รอ 1 วินาทีก่อนจะทำงานต่อ
        // return result;
      } catch (error) {
        console.error("❌ Caught error object:", error);
        if (
          error.message.includes("429") ||
          error.message.includes("You exceeded your current quota") ||
          error.message.includes("current quota")
        ) {
          console.warn(
            `⚠️ Quota exceeded for this key. Rotating to the next key...`
          );
          attempts++;
          requestCounter++;
          lastError = error;
          await delay(timeoutInput.value * 1000); // รอ 1 วินาทีก่อนลองคีย์ถัดไป
          if (!isChecked && autoButton.textContent == "Auto") return; // ⬅️ เพิ่มหลัง await ทันที
        } else {
          if (!isChecked && autoButton.textContent == "Auto") return; // ⬅️ เพิ่มหลัง await ทันที
          // ถ้า error อื่น โยนกลับทันที
          //  console.error(`❌ Non-quota error, stopping retry: ${error.message}`);
          //throw error; // ⬅️ โยนกลับทันที หยุด loop
        }
      }
    }
    if (!success) {
      showAutoCloseAlert(
        `⚠️ API Keys and models exhausted and paused to be available again in ${delayInput.value} minutes.`
      );
      console.error("All API Keys exhausted.");
      if (autoButton.textContent == "Stop") {
        console.log("-----------------");
        let countdown = 0;
        let countdowns = 0; // จำนวนวินาทีที่ต้องการรอ
        countdowns = delayInput.value * 60 * 1000; // แปลงนาทีเป็นมิลลิวินาที
        countdown = delayInput.value * 60; // แปลงวินาทีเป็นนาที
        // ฟังก์ชันสำหรับอัพเดตสถานะพร้อมนับเวลาถอยหลัง
        countdownInterval = setInterval(() => {
          updateStatus(
            `⏳ Retrying in ${countdown} seconds...`,
            "rgb(209, 153, 247)"
          );
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        // รอ 20 วินาทีแบบ async
        await delay(countdowns);

        clearInterval(countdownInterval);

        updateStatus("🚀 Starting work...", "#00BFFF");
      }
    }
  }

  //--------------------------------------------------------------------
  function showAutoCloseAlert(message, duration = 10000) {
    const alertBox = document.createElement("div");
    alertBox.innerHTML = `${message}`;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.left = "50%";
    alertBox.style.width = "500px";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.background = "rgb(255, 187, 0)";
    alertBox.style.color = "#fff";
    alertBox.style.padding = "12px 20px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    alertBox.style.fontSize = "16px";
    alertBox.style.zIndex = "99999999999999999";
    document.body.appendChild(alertBox);

    // ปิดหลังจากผ่านไป 5 วินาที
    setTimeout(() => {
      alertBox.remove();
    }, duration);
  }

  // ตัวอย่างการใช้งาน

  async function getinput(title, keywords, categoryId, FileTypeId) {
    const textarea = document.querySelector("textarea.input--full.title-input");
    if (textarea) {
      textarea.value = title;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      //textarea.focus();
    } else {
      console.log("ไม่พบ textarea");
    }

    const keywordsTextarea = document.querySelector(
      "#content-keywords-ui-textarea"
    );
    if (keywordsTextarea) {
      keywordsTextarea.value = keywords;
      keywordsTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      //keywordsTextarea.focus();
    } else {
      console.log("ไม่พบ textarea (Paste Keywords...)");
    }

    if (Category == true) {
      await changeCategory(categoryId);
    }
    if (FileType == true) {
      await changeContentType(FileTypeId);
    }
    if (CreatedbyAI == true) {
      await changeCheckbox();
    }
    if (Editorialcontent == true) {
      await changeEditorial();
    }
    await delay(2000);
    document.querySelector('button[data-t="save-work"]').click();
    console.log("---------------------------------");
  }
  async function changeCategory(categoryId) {
    console.log("categoryId:", categoryId);

    const selectCategory = document.querySelector('select[name="category"]');
    // สร้างแมปสำหรับหมวดหมู่
    const categoryMap = {
       1: "Animals",
  2: "Buildings and Architecture",
  3: "Business",
  4: "Drinks",
  5: "The Environment",
  6: "States of Mind",
  7: "Food",
  8: "Graphic Resources",
  9: "Hobbies and Leisure",
  10: "Industry",
  11: "Landscapes",
  12: "Lifestyle",
  13: "People",
  14: "Plants and Flowers",
  15: "Culture and Religion",
  16: "Science",
  17: "Social Issues",
  18: "Sports",
  19: "Technology",
  20: "Transport",
  21: "Travel"
    };

    // ตรวจสอบว่า categoryId มีค่าหรือไม่ ถ้ามีให้ใช้ค่าใน categoryMap

     const category = document.querySelectorAll(".cm4dRG_spectrum-Dropdown-trigger")
    if (category) {
      const categoryButton = category[1];
     categoryButton.click();
      console.log("คลิกปุ่ม File Type แล้ว");
      await delay(3000); // รอให้เมนูแสดงผล
      Array.from(document.querySelectorAll("div[role='option']"))
      .find(opt => opt.textContent.trim() === categoryMap[categoryId])
      ?.click();
    } else {
      console.log("ไม่พบ File Type");
    }
  }


  async function changeContentType(FileTypeId) {
    console.log("FileTypeId:", FileTypeId);

    const firstBtn = document.querySelectorAll("button.cm4dRG_spectrum-Dropdown-trigger")[0];
if (firstBtn) {
  const label = firstBtn.textContent.trim();
  if (label.toLowerCase() === "videos" || label.toLowerCase() === "vectors") {
    console.log("✅ ปุ่ม [0] คือ Vector");
    return; // ถ้าเป็น Vector อยู่แล้ว ไม่ต้องทำอะไร
  } else {
    console.log("❌ ปุ่ม [0] ไม่ใช่ Vector:", label);
  }
}


    // สร้างแมปสำหรับ FileTypeId -> contentType ที่ต้องการใช้
    const contentTypeMap = {
      1: "Photos",
      2: "Illustrations",
    };

    // ตรวจสอบว่า FileTypeId มีค่าหรือไม่ และอยู่ใน contentTypeMap
    
      
      const fileType = document.querySelectorAll(".cm4dRG_spectrum-Dropdown-trigger")
    if (fileType) {
      const fileTypeButton = fileType[0];
      fileTypeButton.click();
      console.log("คลิกปุ่ม File Type แล้ว");
      await delay(3000); // รอให้เมนูแสดงผล
      Array.from(document.querySelectorAll("div[role='option']"))
      .find(opt => opt.textContent.trim() === contentTypeMap[FileTypeId])
      ?.click();
    } else {
      console.log("ไม่พบ File Type");
    }



  
  }
  async function changeCheckbox() {
    const checkboxxx = document.querySelector(
      'input[data-t="content-tagger-illustrative-editorial-checkbox"]'
    );

    // ตรวจสอบว่าอยู่ใน label class ที่ถูกต้อง
    if (checkboxxx) {
      const label = checkboxxx.closest(
        "label._59xJYq_spectrum-Checkbox._59xJYq_is-checked"
      );
      if (label) {
        label.click(); // คลิก checkbox ผ่าน label
      } else {
        console.log('ไม่พบ label ที่มี class "_59xJYq_spectrum-Checkbox"');
      }
    } else {
      console.log(
        'ไม่พบ input ที่มี data-t="content-tagger-illustrative-editorial-checkbox"'
      );
    }

    let checkboxss = document.getElementById(
      "content-tagger-generative-ai-property-release-checkbox"
    );
    if (!checkboxss) {
      let checkbox = document.getElementById(
        "content-tagger-generative-ai-checkbox"
      );
      if (checkbox) {
        checkbox.click();
        // รอให้ checkbox ตัวที่สองปรากฏก่อนทำงาน (เช่น 1 วินาที)
        setTimeout(() => {
          let checkbox1 = document.getElementById(
            "content-tagger-generative-ai-property-release-checkbox"
          );
          if (checkbox1) {
            checkbox1.click();
          } else {
            console.log("ไม่พบ checkbox ที่สองบนหน้าเว็บ");
          }
        }, 500); // ปรับเวลาตามที่ต้องการ (1000 = 1 วินาที)
      } else {
        console.log("ไม่พบ checkbox แรกบนหน้าเว็บ");
      }
    } else {
      let checkbox = document.getElementById(
        "content-tagger-generative-ai-checkbox"
      );
      if (checkbox) {
        checkbox.click();
      } else {
        console.log("ไม่พบ checkbox แรกบนหน้าเว็บ");
      }
      changeCheckbox();
    }
    console.log(
      "---------------------------------------------------------------------------"
    );

    await delay(2000);

    const checkbox = document.querySelector(
      '.spectrum-Checkbox_4870fc.is-checked_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
    );

    if (!checkbox) {
      const checkbox3 = document.querySelector(
        '.spectrum-Checkbox_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
      );

      if (checkbox3 && !checkbox3Clicked) {
        checkbox3Clicked = true; // กำหนดว่า checkbox3 ถูกคลิกไปแล้ว

        checkbox3.click();
        console.log("✅ คลิก Checkbox สำเร็จ!--------kkkk------");
      } else {
        console.log("❌ ไม่พบ Checkbox ให้คลิก1 หรือถูกคลิกไปแล้ว");
      }
    } else {
      console.log("ไม่พบ checkbox ที่ต้องการ");
    }
    checkbox3Clicked = false;
  }

  async function changeEditorial() {
    const checkboxInput = document.querySelector(
      "input#content-tagger-generative-ai-checkbox"
    );

    if (
      checkboxInput &&
      checkboxInput.closest("label").classList.contains("_59xJYq_is-checked")
    ) {
      checkboxInput.click();
    }

    // หาตัว checkbox ด้วย data-t
    const checkbox = document.querySelector(
      'input[data-t="content-tagger-illustrative-editorial-checkbox"]'
    );

    // ตรวจสอบว่าอยู่ใน label class ที่ถูกต้อง
    if (checkbox) {
      const label = checkbox.closest("label._59xJYq_spectrum-Checkbox");
      if (label) {
        label.click(); // คลิก checkbox ผ่าน label
      } else {
        console.log('ไม่พบ label ที่มี class "_59xJYq_spectrum-Checkbox"');
      }
    } else {
      console.log(
        'ไม่พบ input ที่มี data-t="content-tagger-illustrative-editorial-checkbox"'
      );
    }
  }
  //////////////////////////////////////////////////////////////////////////

  // สร้างพื้นหลังโปร่งแสง (overlay)
  const popupOverlays = document.createElement("div");
  popupOverlays.style.position = "fixed";
  popupOverlays.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
  popupOverlays.style.top = "0";
  popupOverlays.style.left = "0";
  popupOverlays.style.width = "100%";
  popupOverlays.style.height = "100%";
  popupOverlays.style.display = "none"; //flex
  popupOverlays.style.alignItems = "center";
  popupOverlays.style.justifyContent = "center";
  popupOverlays.style.zIndex = "10000";

  // สร้างกล่อง UI หลัก
  const popupContent = document.createElement("div");
  popupContent.style.backgroundColor = "white";
  popupContent.style.padding = "20px";
  popupContent.style.borderRadius = "10px";
  popupContent.style.width = "350px";
  popupContent.style.color = "black";
  popupContent.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
  popupContent.style.fontFamily = "Arial, sans-serif";
  popupContent.style.position = "relative";

  // ปุ่มปิด (X)
  const closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "15px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "18px";
  closeButton.addEventListener("click", () => {
    popupOverlays.style.display = "none";
  });

  // หัวข้อ "Settings"
  const title = document.createElement("h3");
  title.textContent = "Settings";
  title.style.textAlign = "center";
  title.style.marginTop = "0px";

  // สร้าง container หลัก
  const apiContainer = document.createElement("div");
  apiContainer.style.display = "flex";
  apiContainer.style.flexDirection = "column";
  apiContainer.style.gap = "10px";

  // สร้าง radio button สำหรับเลือก API
  const radioContainer = document.createElement("div");
  radioContainer.style.display = "flex";
  radioContainer.style.gap = "10px";

  // สร้าง radio button สำหรับ OpenAI
  const openAiRadio = document.createElement("input");
  openAiRadio.type = "radio";
  openAiRadio.name = "apiOption";
  openAiRadio.value = "openai";
  openAiRadio.id = "openaiRadio";
  openAiRadio.checked = localStorage.getItem("chatgptRadio") === "true";

  const openAiLabel = document.createElement("label");
  openAiLabel.textContent = "ChatGPT";
  openAiLabel.htmlFor = "openaiRadio";

  // สร้าง radio button สำหรับ Gemini
  const geminiRadio = document.createElement("input");
  geminiRadio.type = "radio";
  geminiRadio.name = "apiOption";
  geminiRadio.value = "Gemini";
  geminiRadio.id = "geminiRadio";
  geminiRadio.checked = localStorage.getItem("geminiRadio") === "true";

  const geminiLabel = document.createElement("label");
  geminiLabel.textContent = "Gemini";
  geminiLabel.htmlFor = "geminiRadio";

  // เพิ่ม radio button ลงใน container
  radioContainer.appendChild(openAiRadio);
  radioContainer.appendChild(openAiLabel);
  radioContainer.appendChild(geminiRadio);
  radioContainer.appendChild(geminiLabel);

  // ช่องกรอก API Key OpenAI
  const chatgptContainer = document.createElement("div");
  const apiLabel = document.createElement("label");
  apiLabel.textContent = "API Key OpenAI (ChatGPT):";
  const apiInput = document.createElement("input");
  apiInput.type = "text";
  apiInput.style.width = "100%";
  apiInput.style.backgroundColor = "white";
  apiInput.style.padding = "5px";
  apiInput.style.marginBottom = "10px";
  apiInput.style.border = "1px solid #ccc";
  apiInput.style.borderRadius = "5px";
  apiInput.value = localStorage.getItem("chatgpt_api_key") || "";

  chatgptContainer.appendChild(apiLabel);
  chatgptContainer.appendChild(apiInput);

  const models = [
    "Automatic Model Selection",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
  ];

  // สร้าง select element
  const select = document.createElement("select");
  select.id = "modelDropdown";

  // สไตล์ขาวดำ
  select.style.width = "100%";
  select.style.padding = "5px 5px 5px 15px";
  select.style.fontSize = "14px";
  select.style.fontWeight = "500";
  select.style.color = "#222"; // สีดำเข้ม
  select.style.backgroundColor = "#fff"; // ขาว
  select.style.border = "2px solid #444"; // เทาเข้ม
  select.style.borderRadius = "8px";
  select.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
  select.style.appearance = "none";
  select.style.webkitAppearance = "none";
  select.style.mozAppearance = "none";
  select.style.cursor = "pointer";
  select.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";

  // ลูกศรสีดำ (SVG inline)
  select.style.backgroundImage = `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3e%3cpath fill='%23444' d='M1 1l5 5 5-5'/%3e%3c/svg%3e")`;
  select.style.backgroundRepeat = "no-repeat";
  select.style.backgroundPosition = "right 15px center";
  select.style.backgroundSize = "12px 8px";

  // hover effect สีเทาเข้มขึ้น
  select.addEventListener("mouseenter", () => {
    select.style.borderColor = "#222";
    select.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  });
  select.addEventListener("mouseleave", () => {
    select.style.borderColor = "#444";
    select.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
  });

  // เพิ่ม Event Listener เพื่อบันทึกค่าที่เลือก
  select.addEventListener("change", () => {
    localStorage.setItem("selectedModel", select.value);
    console.log("Selected model:", select.value);
    // อัพเดตสถานะเมื่อเปลี่ยนโมเดล
    updateStatusL(`Selected model: ${select.value}`, "rgb(0, 0, 0)");
  });

  // สร้าง option แต่ละตัวจาก models array
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    select.appendChild(option);
  });

  // ตั้งค่า selected value หลังจากสร้าง options แล้ว
  const savedModel = localStorage.getItem("selectedModel");
  if (savedModel && models.includes(savedModel)) {
    select.value = savedModel;
  } else {
    select.value = "Automatic Model Selection";
    localStorage.setItem("selectedModel", select.value); // บันทึกค่าเริ่มต้น
  }

  const modelsgpt = ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "gpt-4-nano"];

  const selectGpt = document.createElement("select");
  selectGpt.id = "modelDropdown";

  // สไตล์ขาวดำ
  selectGpt.style.width = "100%";
  selectGpt.style.padding = "5px 5px 5px 15px";
  selectGpt.style.fontSize = "14px";
  selectGpt.style.fontWeight = "500";
  selectGpt.style.color = "#222"; // สีดำเข้ม
  selectGpt.style.backgroundColor = "#fff"; // ขาว
  selectGpt.style.border = "2px solid #444"; // เทาเข้ม
  selectGpt.style.borderRadius = "8px";
  selectGpt.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
  selectGpt.style.appearance = "none";
  selectGpt.style.webkitAppearance = "none";
  selectGpt.style.mozAppearance = "none";
  selectGpt.style.cursor = "pointer";
  selectGpt.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";

  // ลูกศรสีดำ (SVG inline)
  selectGpt.style.backgroundImage = `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3e%3cpath fill='%23444' d='M1 1l5 5 5-5'/%3e%3c/svg%3e")`;
  selectGpt.style.backgroundRepeat = "no-repeat";
  selectGpt.style.backgroundPosition = "right 15px center";
  selectGpt.style.backgroundSize = "12px 8px";

  // hover effect สีเทาเข้มขึ้น
  selectGpt.addEventListener("mouseenter", () => {
    selectGpt.style.borderColor = "#222";
    selectGpt.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  });
  selectGpt.addEventListener("mouseleave", () => {
    selectGpt.style.borderColor = "#444";
    selectGpt.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
  });

  // เพิ่ม Event Listener เพื่อบันทึกค่าที่เลือก
  selectGpt.addEventListener("change", () => {
    localStorage.setItem("selectedModelss", selectGpt.value);
    console.log("Selected model:", selectGpt.value);
    // อัพเดตสถานะเมื่อเปลี่ยนโมเดล
    updateStatusL(`Selected model: ${selectGpt.value}`, "rgb(0, 0, 0)");
  });

  // สร้าง option แต่ละตัวจาก models array
  modelsgpt.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    selectGpt.appendChild(option);
  });

  // ตั้งค่า selected value หลังจากสร้าง options แล้ว
  const savedModels = localStorage.getItem("selectedModelss");
  if (savedModels && modelsgpt.includes(savedModels)) {
    selectGpt.value = savedModels;
  } else {
    selectGpt.value = "gpt-4o-mini";
    localStorage.setItem("selectedModelss", selectGpt.value); // บันทึกค่าเริ่มต้น
  }

  // ช่องกรอก API Key Gemini
  const geminiInputContainer = document.createElement("div");

  // Label ของ textarea
  const geminiInputLabel = document.createElement("label");
  geminiInputLabel.textContent = "API Key Gemini - (one per line):";

  // textarea สำหรับใส่ API Key
  const geminiInput = document.createElement("textarea");
  geminiInput.rows = 4;
  geminiInput.style.width = "100%";
  geminiInput.style.backgroundColor = "white";
  geminiInput.style.padding = "5px";
  geminiInput.style.fontSize = "12px";
  geminiInput.style.marginBottom = "10px";
  geminiInput.style.border = "1px solid #ccc";
  geminiInput.style.borderRadius = "5px";
  geminiInput.placeholder = "Enter one API Key per line";

  const storedKeys = JSON.parse(
    localStorage.getItem("gemini_api_keysL") || "[]"
  );
  geminiInput.value = storedKeys.join("\n");

  // checkbox สำหรับซ่อน/แสดง API Key
  const hideCheckboxLabel = document.createElement("label");
  hideCheckboxLabel.style.display = "block";
  hideCheckboxLabel.style.marginBottom = "10px";
  const hideCheckbox = document.createElement("input");
  hideCheckbox.type = "checkbox";
  hideCheckbox.style.marginRight = "5px";
  hideCheckboxLabel.appendChild(hideCheckbox);
  hideCheckboxLabel.appendChild(document.createTextNode("Hide API Key"));
  hideCheckbox.checked =
    localStorage.getItem("hideGeminiApiKey") === "true" || false; // กำหนดค่าเริ่มต้นจาก localStorage";
  // Event listener สำหรับ checkbox
  hideCheckbox.addEventListener("change", () => {
    if (hideCheckbox.checked) {
      geminiInput.style.color = "transparent"; // ซ่อนค่า
      localStorage.setItem("hideGeminiApiKey", hideCheckbox.checked);
    } else {
      geminiInput.style.color = "black"; // แสดงค่า
      localStorage.setItem("hideGeminiApiKey", hideCheckbox.checked);
    }
  });

  // append ทั้งหมดลง container
  geminiInputContainer.appendChild(geminiInputLabel);
  geminiInputContainer.appendChild(geminiInput);
  geminiInputContainer.appendChild(hideCheckboxLabel);

  // ฟอร์ม timeout
  const timeoutContainer = document.createElement("div");
  timeoutContainer.style.display = "flex";
  timeoutContainer.style.alignItems = "center";
  timeoutContainer.style.gap = "5px";
  timeoutContainer.style.marginBottom = "10px"; // เพิ่มระยะห่างด้านบน

  const timeoutLabel = document.createElement("label");
  timeoutLabel.textContent = "Delay(sec):";
  timeoutLabel.title =
    "กำหนดการหน่วงเวลาในช่วงการสลับ API Key เพื่อไม่ให้เร็วเกินไป\nSet a delay between API Key switches to avoid switching too quickly";
  const timeoutInput = document.createElement("input");
  timeoutInput.type = "number";
  timeoutInput.style.width = "60px";
  timeoutInput.style.backgroundColor = "white";
  timeoutInput.style.padding = "5px";
  timeoutInput.style.border = "1px solid #ccc";
  timeoutInput.style.borderRadius = "5px";
  timeoutInput.title =
    "กำหนดการหน่วงเวลาในช่วงการสลับ API Key เพื่อไม่ให้เร็วเกินไป\nSet a delay between API Key switches to avoid switching too quickly";
  timeoutInput.value = localStorage.getItem("timeout") || 5; // ค่าเริ่มต้นเป็น 60 วินาที

  // ฟอร์ม timedelay
  const delayLabel = document.createElement("label");
  delayLabel.textContent = "Sleep(min):";
  delayLabel.title =
    "กำหนดเวลาหยุดพักเมื่อทำทุก API Key จนครบ เพื่อให้สามารถกลับมาใช้งานได้ใหม่ (เวลาควรนานหน่อย)\nSet a cooldown time after all API Keys have been used to allow them to become usable again (the time should be relatively long)";
  const delayInput = document.createElement("input");
  delayInput.type = "number";
  delayInput.style.width = "60px";
  delayInput.style.backgroundColor = "white";
  delayInput.style.padding = "5px";
  delayInput.style.border = "1px solid #ccc";
  delayInput.style.borderRadius = "5px";
  delayInput.title =
    "กำหนดเวลาหยุดพักเมื่อทำทุก API Key จนครบ เพื่อให้สามารถกลับมาใช้งานได้ใหม่ (เวลาควรนานหน่อย)\nSet a cooldown time after all API Keys have been used to allow them to become usable again (the time should be relatively long)";
  delayInput.value = localStorage.getItem("delay") || 4; // ค่าเริ่มต้นเป็น 1 วินาที

  // เพิ่ม Event Listener เพื่อซ่อน/แสดงช่องกรอก API
  const toggleApiInput = () => {
    if (openAiRadio.checked) {
      chatgptContainer.style.display = "block";
      geminiInputContainer.style.display = "none";
      timeoutContainer.style.display = "none";
      select.style.display = "none"; // ซ่อน select สำหรับโมเดล
      statusDivL.style.display = "none";
      selectGpt.style.display = "block";
    } else {
      chatgptContainer.style.display = "none";
      geminiInputContainer.style.display = "block";
      select.style.display = "block";
      timeoutContainer.style.display = "flex"; // แสดงช่องกรอก timeout
      statusDivL.style.display = "block";
      selectGpt.style.display = "none";
    }
    localStorage.setItem("geminiRadio", geminiRadio.checked);
    localStorage.setItem("chatgptRadio", openAiRadio.checked);
  };

  // ตั้งค่าเริ่มต้น
  toggleApiInput();

  // Event Listener สำหรับเปลี่ยน API ที่เลือก
  openAiRadio.addEventListener("change", toggleApiInput);
  geminiRadio.addEventListener("change", toggleApiInput);

  apiContainer.appendChild(radioContainer);
  apiContainer.appendChild(selectGpt);
  apiContainer.appendChild(chatgptContainer);

  apiContainer.appendChild(select);

  apiContainer.appendChild(geminiInputContainer);

  // ฟอร์ม Title
  const titleContainer = document.createElement("div");
  titleContainer.style.display = "flex";
  titleContainer.style.alignItems = "center";
  titleContainer.style.gap = "5px";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title:";
  titleLabel.title =
    "กำหนดความยาวของชื่อเรื่อง (ค่าเริ่มต้นคือ 50-150)\nSet the title length (default is 50-150)";
  const titleMin = document.createElement("input");
  titleMin.type = "number";
  titleMin.title =
    "กำหนดความยาวขั้นต่ำของชื่อเรื่อง (ค่าเริ่มต้นคือ 50)\nSet the minimum title length (default is 50)";
  titleMin.style.width = "60px";
  titleMin.style.padding = "5px";
  titleMin.style.backgroundColor = "white";
  titleMin.style.border = "1px solid #ccc";
  titleMin.style.borderRadius = "5px";
  titleMin.value = localStorage.getItem("chatgpt_titleMin") || 50;
  const dash = document.createTextNode(" - ");

  const titleMax = document.createElement("input");
  titleMax.type = "number";
  titleMax.title =
    "กำหนดความยาวสูงสุดของชื่อเรื่อง (ค่าเริ่มต้นคือ 150)\nSet the maximum title length (default is 150)";
  titleMax.style.width = "60px";
  titleMax.style.padding = "5px";
  titleMax.style.border = "1px solid #ccc";
  titleMax.style.backgroundColor = "white";
  titleMax.style.borderRadius = "5px";
  titleMax.value = localStorage.getItem("chatgpt_titleMax") || 150;
  // ฟอร์ม Keywords
  const keywordLabel = document.createElement("label");
  keywordLabel.textContent = "Keywords:";
  keywordLabel.title =
    "กำหนดจำนวนคีย์เวิร์ดของภาพ (ค่าเริ่มต้นคือ 50)\nSet the number of keywords for the image (default is 50)";
  const keywordInput = document.createElement("input");
  keywordInput.type = "number";
  keywordInput.title =
    "กำหนดจำนวนคีย์เวิร์ดของภาพ\nSet the number of keywords for the image";
  keywordInput.style.width = "60px";
  keywordInput.style.padding = "5px";
  keywordInput.style.backgroundColor = "white";
  keywordInput.style.border = "1px solid #ccc";
  keywordInput.style.borderRadius = "5px";
  keywordInput.value = localStorage.getItem("chatgpt_keyword") || 50;

  // ฟอร์ม Key Concepts (แยกบรรทัดใหม่)
  const conceptContainer = document.createElement("div");
  conceptContainer.style.marginTop = "10px"; // เพิ่มระยะห่างด้านบน

  // Checkbox เปิด/ปิด Key Concepts
  const conceptCheckbox = document.createElement("input");
  conceptCheckbox.type = "checkbox";
  conceptCheckbox.checked =
    localStorage.getItem("chatgpt_concept_enabled") === "true";
  conceptCheckbox.style.marginRight = "5px";

  // Label + Checkbox
  const conceptLabel = document.createElement("label");
  conceptLabel.textContent = "Key Concepts:";
  conceptLabel.style.marginRight = "10px";
  conceptLabel.title =
    "แนวคิดหลักของภาพ โดยคั่นแต่ละคำด้วยเครื่องหมายจุลภาค( , ) เช่น cat, dog, sunset, mountain\nKey Concepts, separated by commas(,) e.g. cat, dog, sunset, mountain";
  conceptLabel.prepend(conceptCheckbox);

  // Input สำหรับ Key Concepts
  const conceptInput = document.createElement("input");
  conceptInput.type = "text";
  conceptInput.placeholder = "Enter key concepts";
  conceptInput.title =
    "แนวคิดหลักของภาพ โดยคั่นแต่ละคำด้วยเครื่องหมายจุลภาค( , ) เช่น cat, dog, sunset, mountain \nKey Concepts, separated by commas(,) e.g. cat, dog, sunset, mountain";
  conceptInput.style.width = "100%";
  conceptInput.style.padding = "5px";
  conceptInput.style.backgroundColor = "white";
  conceptInput.style.border = "1px solid #ccc";
  conceptInput.style.borderRadius = "5px";
  conceptInput.value = localStorage.getItem("chatgpt_concepts") || "";
  conceptInput.disabled = !conceptCheckbox.checked;

  // จัดการการเปิด/ปิดช่อง conceptInput
  conceptCheckbox.addEventListener("change", () => {
    conceptInput.disabled = !conceptCheckbox.checked;
    localStorage.setItem("chatgpt_concept_enabled", conceptCheckbox.checked);
  });

  // บันทึกเมื่อพิมพ์ในช่อง concept
  conceptInput.addEventListener("input", () => {
    localStorage.setItem("chatgpt_concepts", conceptInput.value);
  });

  // เช็คบ็อกซ์
  const checkboxContainer = document.createElement("div");
  checkboxContainer.style.display = "flex";
  //checkboxContainer.style.justifyContent = "space-between";
  checkboxContainer.style.marginTop = "10px";

  function createCheckbox(labelText) {
    const checkboxWrapper = document.createElement("label");
    checkboxWrapper.style.display = "flex";
    checkboxWrapper.style.alignItems = "center";
    checkboxWrapper.style.gap = "5px";
    checkboxWrapper.style.marginRight = "10px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    // กำหนด Tooltip เป็น 2 ภาษา
    let tooltipText = "";
    if (labelText === "Category") {
      tooltipText =
        "กำหนดเพื่อเลือกหมวดหมู่ของภาพโดยอัตโนมัติ\nAutomatically select the category of the image";
    } else if (labelText === "File Type") {
      tooltipText =
        "กำหนดรูปแบบไฟล์ของภาพโดยอัตโนมัติ\nAutomatically select the file format of the image";
    }

    checkbox.title = tooltipText; // หรือใช้ checkbox.setAttribute("title", tooltipText);

    // ตรวจสอบค่าใน localStorage และกำหนดค่า checked ของ checkbox
    const storedValue = localStorage.getItem(labelText) === "true"; // อ่านค่าใน localStorage
    checkbox.checked = storedValue; // กำหนดสถานะ checkbox

    const label = document.createElement("span");
    label.textContent = labelText;

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);

    // เพิ่ม Event Listener ที่นี่
    checkbox.addEventListener("click", () => {
      console.log(
        `${labelText} checkbox is clicked. Checked: ${checkbox.checked}`
      );
      if (labelText == "Category") {
        Category = checkbox.checked;
      } else if (labelText == "File Type") {
        FileType = checkbox.checked;
      }
      const isChecked = checkbox.checked; // ตรวจสอบสถานะปัจจุบันของ checkbox
      localStorage.setItem(labelText, isChecked);
      // ที่นี่คุณสามารถทำสิ่งอื่นๆ เช่นซ่อน overlay
      // popupOverlays.style.display = checkbox.checked ? "block" : "none";
    });

    return checkboxWrapper;
  }

  // ฟอร์ม Container
  const autoContainersTo = document.createElement("div");
  autoContainersTo.style.marginTop = "10px";
  autoContainersTo.style.display = "flex";
  autoContainersTo.style.gap = "10px"; // ระยะห่างระหว่าง 2 ฟอร์ม

  // ฟอร์ม Created by AI
  const createdByAIWrapper = document.createElement("div");
  const createdByAICheckbox = document.createElement("input");
  createdByAICheckbox.type = "checkbox";
  createdByAICheckbox.checked =
    localStorage.getItem("Created by AI") === "true" || false;
  createdByAICheckbox.title =
    "กำหนดว่าเนื้อหานี้สร้างขึ้นโดย AI\nMark this content as Created by AI.";
  createdByAICheckbox.style.marginRight = "5px";

  const createdByAILabel = document.createElement("label");
  createdByAILabel.textContent = "Created by AI";

  // รวม Created by AI
  createdByAIWrapper.appendChild(createdByAICheckbox);
  createdByAIWrapper.appendChild(createdByAILabel);

  createdByAICheckbox.addEventListener("click", () => {
    CreatedbyAI = createdByAICheckbox.checked;
    console.log(`Created by AI checkbox is clicked. Checked: ${CreatedbyAI}`);
    editorialCheckbox.checked = false;
    Editorialcontent = false;
  });

  // ฟอร์ม Editorial content
  const editorialWrapper = document.createElement("div");
  const editorialCheckbox = document.createElement("input");
  editorialCheckbox.type = "checkbox";
  editorialCheckbox.checked =
    localStorage.getItem("chatgpt_editorial") === "true" || false;
  editorialCheckbox.style.marginRight = "5px";
  editorialCheckbox.title =
    "กำหนดว่าเนื้อหานี้เป็นเชิงบรรณาธิการ\nMark this content as Editorial.";

  const editorialLabel = document.createElement("label");
  editorialLabel.textContent = "Editorial content";

  // รวม Editorial
  editorialWrapper.appendChild(editorialCheckbox);
  editorialWrapper.appendChild(editorialLabel);

  editorialCheckbox.addEventListener("click", () => {
    Editorialcontent = editorialCheckbox.checked;
    console.log(
      `Editorial content checkbox is clicked. Checked: ${Editorialcontent}`
    );
    createdByAICheckbox.checked = false;
    CreatedbyAI = false;
  });

  // รวมทั้งหมดเข้ากับ Container
  autoContainersTo.appendChild(createdByAIWrapper);
  autoContainersTo.appendChild(editorialWrapper);

  // ฟอร์ม Container
  const autoContainers = document.createElement("div");
  autoContainers.style.marginTop = "10px";
  autoContainers.style.display = "flex";

  //autoContainers.style.flexDirection = "column";
  //autoContainers.style.alignItems ="right";
  autoContainers.style.gap = "10px"; // ระยะห่างระหว่าง Image and Filename และ SEO Auto Ranking

  // ฟอร์ม Image and Filename
  const imageAndFilenameWrapper = document.createElement("div");
  const imageAndFilenameCheckbox = document.createElement("input");
  imageAndFilenameCheckbox.type = "checkbox";
  imageAndFilenameCheckbox.checked =
    localStorage.getItem("chatgpt_image_filename") === "true" || false;
  imageAndFilenameCheckbox.title =
    "จะทำการเอาชื่อไฟล์และรูปภาพนำมาประมวลผลรวมกัน\nCombine the filename and image for processing.";

  imageAndFilenameCheckbox.style.marginRight = "5px";

  const imageAndFilenameLabel = document.createElement("label");
  imageAndFilenameLabel.textContent = "Image and Filename";

  // รวม Image and Filename
  imageAndFilenameWrapper.appendChild(imageAndFilenameCheckbox);
  imageAndFilenameWrapper.appendChild(imageAndFilenameLabel);

  // ฟอร์ม SEO Auto Ranking
  const seoAutoRankingWrapper = document.createElement("div");
  const seoAutoRankingCheckbox = document.createElement("input");
  seoAutoRankingCheckbox.type = "checkbox";
  seoAutoRankingCheckbox.checked =
    localStorage.getItem("chatgpt_seo_ranking") === "true" || false;
  seoAutoRankingCheckbox.style.marginRight = "5px";
  seoAutoRankingCheckbox.title =
    "กำหนดเพื่อทำการปรับปรุง SEO และจัดอันดับอัตโนมัติ\nSet to automatically improve SEO and ranking.";

  const seoAutoRankingLabel = document.createElement("label");
  seoAutoRankingLabel.textContent = "SEO Ranking";

  // รวม SEO Auto Ranking
  seoAutoRankingWrapper.appendChild(seoAutoRankingCheckbox);
  seoAutoRankingWrapper.appendChild(seoAutoRankingLabel);

  // เพิ่มฟอร์มทั้งหมดเข้าไปใน container

  // ฟอร์ม Container
  const autoContainer = document.createElement("div");
  autoContainer.style.marginTop = "20px";
  autoContainer.style.display = "flex";
  autoContainer.style.alignItems = "center";

  autoContainer.style.gap = "20px"; // ระยะห่างระหว่าง Auto Submit และ Auto Full

  // ฟอร์ม Auto Submit
  const autoSubmitWrapper = document.createElement("div");
  const autoSubmitCheckbox = document.createElement("input");
  autoSubmitCheckbox.type = "checkbox";
  autoSubmitCheckbox.checked =
    localStorage.getItem("chatgpt_auto_submit") === "true" || false;
  autoSubmitCheckbox.title =
    "กำหนดเมื่อใส่ข้อมูลครบทุกภาพ จะทำการส่งภาพอัตโนมัติ\nAutomatically submit the image once all information is filled";

  autoSubmitCheckbox.style.marginRight = "5px";

  const autoSubmitLabel = document.createElement("label");
  autoSubmitLabel.textContent = "Auto Submit";

  // สร้าง Beta label
  const betaLabelSubmit = document.createElement("span");
  betaLabelSubmit.textContent = "Beta";
  betaLabelSubmit.style.fontSize = "10px";
  betaLabelSubmit.style.color = "red";
  betaLabelSubmit.style.marginLeft = "3px";
  betaLabelSubmit.style.verticalAlign = "super";

  // รวม Auto Submit
  autoSubmitWrapper.appendChild(autoSubmitCheckbox);
  autoSubmitWrapper.appendChild(autoSubmitLabel);
  autoSubmitWrapper.appendChild(betaLabelSubmit);

  // ฟอร์ม Auto Full
  const autoFullWrapper = document.createElement("div");
  const autoFullCheckbox = document.createElement("input");
  autoFullCheckbox.type = "checkbox";
  autoFullCheckbox.checked =
    localStorage.getItem("chatgpt_auto_full") === "true" || false;
  autoFullCheckbox.style.marginRight = "5px";
  autoFullCheckbox.title =
    "กำหนดเพื่อทำการวนซ้ำการทำงาน ใส่ข้อมูล > ส่งภาพ จนกว่าจะครบทุกภาพที่มีในพอร์ต Adobe stock\nSet to loop the process of entering information > submitting images until all images in the Adobe Stock portfolio are processed.";

  const autoFullLabel = document.createElement("label");
  autoFullLabel.textContent = "Auto Loop";

  // สร้าง Beta label
  const betaLabelFull = document.createElement("span");
  betaLabelFull.textContent = "Beta";
  betaLabelFull.style.fontSize = "10px";
  betaLabelFull.style.color = "red";
  betaLabelFull.style.marginLeft = "3px";
  betaLabelFull.style.verticalAlign = "super";

  // รวม Auto Full
  autoFullWrapper.appendChild(autoFullCheckbox);
  autoFullWrapper.appendChild(autoFullLabel);
  autoFullWrapper.appendChild(betaLabelFull);

  checkboxContainer.appendChild(createCheckbox("Category"));
  checkboxContainer.appendChild(createCheckbox("File Type"));

  // ปุ่ม SAVE
  const saveButton = document.createElement("button");
  saveButton.textContent = "SAVE";
  saveButton.style.width = "100%";
  saveButton.style.padding = "10px";
  saveButton.style.backgroundColor = "black";
  saveButton.style.color = "white";
  saveButton.style.border = "none";
  saveButton.style.borderRadius = "10px";
  saveButton.style.marginTop = "15px";
  saveButton.style.cursor = "pointer";

  const vnameLabel = document.createElement("label");
  vnameLabel.textContent = "V 1.5.1 By AG Generator";
  vnameLabel.style.fontSize = "10px"; // ขนาดฟอนต์เล็กลง
  vnameLabel.style.display = "block"; // ให้ label เป็น block element
  vnameLabel.style.textAlign = "center"; // จัดข้อความตรงกลางภายใน label
  vnameLabel.style.margin = "10px auto 0 auto"; // top:10px, right:auto, bottom:0, left:auto

  // จัดเรียงองค์ประกอบ
  popupContent.appendChild(closeButton);
  popupContent.appendChild(title);
  popupContent.appendChild(apiContainer);
  /* popupContent.appendChild(apiInput);
 // popupContent.appendChild(apiFeedback);

  popupContent.appendChild(geminiLabel);
  popupContent.appendChild(geminiInput);
*/

  popupContent.appendChild(timeoutContainer);
  timeoutContainer.appendChild(timeoutLabel);
  timeoutContainer.appendChild(timeoutInput);
  timeoutContainer.appendChild(delayLabel);
  timeoutContainer.appendChild(delayInput);

  // เพิ่ม titleContainer และ conceptContainer

  titleContainer.appendChild(titleLabel);
  titleContainer.appendChild(titleMin);
  titleContainer.appendChild(dash);
  titleContainer.appendChild(titleMax);
  titleContainer.appendChild(keywordLabel);
  titleContainer.appendChild(keywordInput);

  conceptContainer.appendChild(conceptLabel);
  conceptContainer.appendChild(conceptInput);

  popupContent.appendChild(titleContainer);
  popupContent.appendChild(conceptContainer);

  popupContent.appendChild(checkboxContainer);
  // เพิ่ม autoSubmitContainer ไปที่ popupContent
  // นำทั้งหมดมาแสดงผลในบรรทัดเดียวกัน
  autoContainers.appendChild(imageAndFilenameWrapper);
  autoContainers.appendChild(seoAutoRankingWrapper);

  // ถ้าอยากเพิ่มในหน้า HTML
  popupContent.appendChild(autoContainersTo);
  popupContent.appendChild(autoContainers);
  autoContainer.appendChild(autoSubmitWrapper);
  autoContainer.appendChild(autoFullWrapper);
  popupContent.appendChild(autoContainer);
  popupContent.appendChild(saveButton);
  popupContent.appendChild(vnameLabel);

  // ใส่ popupContent ลงใน popupOverlay
  popupOverlays.appendChild(popupContent);

  // ใส่ popupOverlay ลงใน document
  document.body.appendChild(popupOverlays);

  saveButton.addEventListener("click", async () => {
    closeButton.style.display = "none";
    const rawKeys = geminiInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (openAiRadio.checked) {
      if (!apiInput.value) {
        alert("Please enter your OpenAI API Key");
        return;
      }
      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiInput.value}`,
          },
        });
        statusDivL.style.display = "none";
        if (response.ok) {
          console.log("✅ OpenAI API Key is valid and working.");
        } else {
          alert("Invalid OpenAI API Key. Please enter a valid key");

          return;
        }
      } catch (error) {
        alert("Invalid OpenAI API Key. Please enter a valid key");

        return;
      }
    } else {
      if (rawKeys.length === 0) {
        alert("Please enter at least one Gemini API Key.");
        return;
      }
      const validKeys = [];
      const invalidKeys = [];
      const sumall = [];
      for (let i = 0; i < rawKeys.length; i++) {
        const key = rawKeys[i];
        try {
          const ai = new GoogleGenAI({ apiKey: key });

          const promptText = `Is the API key working? Yes or no?`;
          const contents = [
            {
              role: "user",
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ];
          const config = {
            maxOutputTokens: 100,
            // temperature: 0.8,
            // topP: 0.95,
          };
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            config,
            contents,
          });
          console.log(response.text);
          // ดึงผลลัพธ์ข้อความ
          console.log("gemini-2.0-flash-lite");
          console.log(`✅ Key ${i + 1} valid: ${key.slice(-8)}...`);
          sumall.push(key);
          validKeys.push(key); // เก็บเฉพาะ Key ที่ใช้ได้
        } catch (error) {
          console.warn(`❌ Key ${i + 1} invalid: ${key.slice(-8)}...`, error);
          sumall.push(key);
          invalidKeys.push(key);
          // ไม่ push key นี้
        }
      }

      if (validKeys.length === 0) {
        alert("❌ All Gemini API Keys are invalid.");
        return;
      }

      // ทำข้อความสรุป
      let summary = `✅ ${validKeys.length} valid API Key(s)\n❌ ${invalidKeys.length} invalid API Key(s)\n\n`;

      if (validKeys.length > 0) {
        summary += "Valid keys:\n";
        summary += validKeys
          .map((k, i) => `${i + 1}. ...${k.slice(-8)}`)
          .join("\n");
        summary += "\n\n";
      }

      if (invalidKeys.length > 0) {
        summary += "Invalid keys:\n";
        summary += invalidKeys
          .map((k, i) => `${i + 1}. ...${k.slice(-8)}`)
          .join("\n");
      }

      alert(summary);
      localStorage.setItem("gemini_api_keysL", JSON.stringify(sumall)); // เก็บทุก key ที่ตรวจสอบแล้ว
      requestCounter = 0;
      updateStatusL(`🔑API Key ${sumall.length}`, "rgb(0, 0, 0)");
    }

    localStorage.setItem("chatgpt_api_key", apiInput.value);
    localStorage.setItem("timeout", timeoutInput.value);
    localStorage.setItem("delay", delayInput.value);
    localStorage.setItem("chatgpt_titleMin", titleMin.value);
    localStorage.setItem("chatgpt_titleMax", titleMax.value);
    localStorage.setItem("chatgpt_keyword", keywordInput.value);
    localStorage.setItem("chatgpt_auto_submit", autoSubmitCheckbox.checked);
    localStorage.setItem("chatgpt_auto_full", autoFullCheckbox.checked);
    localStorage.setItem(
      "chatgpt_image_filename",
      imageAndFilenameCheckbox.checked
    );
    localStorage.setItem("Created by AI", createdByAICheckbox.checked);
    localStorage.setItem("chatgpt_editorial", editorialCheckbox.checked);
    localStorage.setItem("chatgpt_concepts", conceptInput.value);
    localStorage.setItem("chatgpt_seo_ranking", seoAutoRankingCheckbox.checked);
    closeButton.style.display = "block";
    alert("Save Completed!");
    popupOverlays.style.display = "none";
  });

  async function buttonCheckbox() {
    popupOverlay.style.display = "block";
    image.style.display = "none";
    loader.style.display = "block";
    keywordss.style.display = "none";
    tokens.style.display = "none";
    titles.innerText = `Wait a moment... The image sending process is in progress.`;
    titles.style.display = "block";
    const checkbox = document.querySelector(
      ".mti-icon.left.mti-large.icon-checkbox-inactive"
    );

    if (checkbox) {
      checkbox.click();
      console.log("✅ คลิก Checkbox สำเร็จ!");

      await changeCheckbox();
      // คลิก checkbox ที่อยู่ภายใต้ class ที่กำหนด
    } else {
      console.log("❌ ไม่พบ Checkbox ให้คลิก3");
    }
    /* 
    const checkbox2 = document.querySelector(
      '.spectrum-Checkbox_4870fc.is-indeterminate_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
    );
    const checkboxs2 = document.querySelector(
      '.spectrum-Checkbox_4870fc.is-checked_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
    );
    const checkboxs3 = document.querySelector(
      '.spectrum-Checkbox_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
    );

    if (checkbox2) {
      checkbox2.click();
      console.log("✅ คลิก Checkbox สำเร็จ!2");
      const checkbox3 = document.querySelector(
        '.spectrum-Checkbox_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
      );

      if (checkbox3) {
        await delay(2000);
        checkbox3.click();
        //buttonCheckbox();
        console.log("✅ คลิก Checkbox สำเร็จ!--------------");
      } else {
        console.log("❌ ไม่พบ Checkbox ให้คลิก1");
      }
    } else if (checkboxs3) {
      checkboxs3.click();
        if(checkbox2 || checkboxs2){

        }else{
          checkboxs3.click();
        }
      //buttonCheckbox();
      console.log("✅ คลิก Checkbox สำเร็จ!------------2--");
    } else {
      console.log("❌ ไม่พบ Checkbox ให้คลิก2");
    }

    */
    // คลิก checkbox ที่อยู่ภายใต้ class ที่กำหนด
    const checkbox2 = document.querySelector(
      '.spectrum-Checkbox_4870fc.is-indeterminate_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
    );

    if (checkbox2) {
      checkbox2.click();
      console.log("✅ คลิก Checkbox สำเร็จ!");
      const checkbox3 = document.querySelector(
        '.spectrum-Checkbox_4870fc input[data-t="reusable-checkbox"][type="checkbox"]'
      );

      if (checkbox3) {
        checkbox3.click();
        //buttonCheckbox();
        console.log("✅ คลิก Checkbox สำเร็จ!--------------");
      } else {
        console.log("❌ ไม่พบ Checkbox ให้คลิก1");
      }
    } else {
      console.log("❌ ไม่พบ Checkbox ให้คลิก2");
    }
  }

  async function clickSubmitButton() {
    const submitButton = document.querySelector(
      'button[data-t="submit-moderation-button"]'
    );

    if (submitButton) {
      submitButton.click(); // คลิกปุ่ม
      console.log("✅ คลิกปุ่ม 'Submit 100 files' สำเร็จ!");
      clickGuidelinesButtons();
    } else {
      console.log("❌ ไม่พบปุ่ม 'Submit 100 files'");
    }
  }

  async function clickGuidelinesButtons() {
    await delay(10000);
    const reviewedButton = document.getElementById("tc-reviewed-guidelines");
    const understandButton = document.getElementById(
      "tc-understand-guidelines"
    );

    if (reviewedButton) {
      reviewedButton.click(); // คลิกปุ่ม "Reviewed Guidelines"
      console.log("✅ คลิกปุ่ม 'Reviewed Guidelines' สำเร็จ!");
    } else {
      console.log("❌ ไม่พบปุ่ม 'Reviewed Guidelines' ยัง");
    }

    if (understandButton) {
      understandButton.click(); // คลิกปุ่ม "Understand Guidelines"
      console.log("✅ คลิกปุ่ม 'Understand Guidelines' สำเร็จ!");
      clickDialogButton();
    } else {
      console.log("❌ ไม่พบปุ่ม 'Understand Guidelines' ยัง");
      clickSubmitButtonss();
    }
  }

  function clickDialogButton() {
    const checkInterval = setInterval(async () => {
      const dialogButton = document.querySelector(
        ".button.button--dialog.button--dialog-inactive"
      );

      if (dialogButton) {
        dialogButton.click(); // คลิกปุ่มที่มี class ที่กำหนด
        console.log("✅ คลิกปุ่ม 'Dialog' สำเร็จ!");
        const checkIntervals = setInterval(async () => {
          const dialogButtons = document.querySelector(
            'div[class^="ObjectIdentificationstyle__ObjectIdentificationImage"] img'
          );

          if (dialogButtons) {
            await clickAllImages();
            clearInterval(checkIntervals);
          } else {
            console.log("❌ ไม่พบปุ่ม 'Dialog' ยัง");
            const submitButton = document.querySelector(
              'button[data-t="send-moderation-button"]'
            );

            if (submitButton) {
              submitButton.click();
              console.log("✅ คลิกปุ่ม 'Submit'---1 สำเร็จ!");
              popupOverlay.style.display = "none";
              loader.style.display = "none";
              titles.style.display = "none";
              if (autoFullCheckbox.checked === true && chacknext === false) {
                setTimeout(navlink, 10000);
              }
              clearInterval(checkIntervals);
            } else {
              console.log(
                "❌ ไม่พบปุ่ม 'Submit' อาจจะยังไม่โหลดหรือเป็นปุ่มที่ไม่สามารถกดได้"
              );
            }
          }
        }, 1000); // ตรวจสอบทุก ๆ 1000 มิลลิวินาที (1 วินาที)

        clearInterval(checkInterval); // หยุดการตรวจสอบเมื่อคลิกปุ่มสำเร็จ
      } else {
        console.log("❌ ไม่พบปุ่ม 'Dialog' ยัง");
      }
    }, 1000); // ตรวจสอบทุก ๆ 1000 มิลลิวินาที (1 วินาที)
  }

  async function clickAllImages() {
    let as = 0;
    const imgElements = document.querySelectorAll(
      'div[class^="ObjectIdentificationstyle__ObjectIdentificationImage"] img'
    );

    if (imgElements.length > 0) {
      imgElements.forEach(async (img, index) => {
        const imageUrl = img.src; // ดึง URL ของรูปภาพ
        console.log(`✅ พบรูปภาพที่ ${index + 1}:`, imageUrl);
        let hasCat = false;
        // ตรวจสอบว่าภาพมีแมวหรือไม่
        if (openAiRadio.checked) {
          hasCat = await checkCatWithGPT4o(imageUrl);
        } else {
          hasCat = await checkCatWithGemini(imageUrl);
        }
        // เรียกใช้ฟังก์ชันตรวจสอบ
        as++;
        // คลิกเฉพาะถ้าภาพมีแมว
        if (hasCat) {
          img.click();
          console.log(`✅ คลิกรูปภาพที่ ${index + 1} สำเร็จ!`);
        } else {
          console.log(`❌ รูปภาพที่ ${index + 1} ไม่มีแมว`);
        }
        if (as == 6) {
          await delay(5000);
          clickDialogButtons();
          clickVerifyButton();

          console.log(`--${as}----${index}`);
        }
      });
    } else {
      console.log("❌ ไม่พบรูปภาพที่ต้องการคลิก");
    }
  }

  function clickDialogButtons() {
    const checkInterval = setInterval(() => {
      const dialogButton = document.querySelector(
        ".button.button--dialog.button--dialog-inactive"
      );

      if (dialogButton) {
        dialogButton.click(); // คลิกปุ่ม
        console.log("✅ คลิกปุ่ม 'Dialog' สำเร็จ!--13");
        // setTimeout(navlink, 10000);
        clearInterval(checkInterval); // หยุดการตรวจสอบเมื่อคลิกปุ่มสำเร็จ
      } else {
        console.log("❌ ไม่พบปุ่ม 'Dialog' ยัง");
      }
    }, 1000); // ตรวจสอบทุก ๆ 1000 มิลลิวินาที (1 วินาที)
  }

  function clickVerifyButton() {
    const verifyButton = document.querySelector(
      'button[data-t="send-moderation-button"]'
    );

    if (verifyButton) {
      verifyButton.click();
      console.log("✅ คลิกปุ่ม 'Verify' สำเร็จ!");
      setTimeout(getImageLink, 3000);
    } else {
      console.log("❌ ไม่พบปุ่ม 'Verify'");
    }
  }
  // ฟังก์ชันตรวจสอบภาพแมว
  async function checkCatWithGPT4o(imageUrl) {
    const apiKey = apiInput.value;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Does this image contain a cat? Please respond with "Yes" or "No".`,
              },
              {
                type: "image_url",
                image_url: {
                  detail: "low",
                  url: `${imageUrl}`,
                },
              },
            ],
          },
          {
            role: "system",
            content:
              'Respond strictly in the format: answer="..." without any additional text or symbols.',
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    // รับข้อมูลจากการตอบกลับ
    const data = await response.json();
    const content = data.choices[0].message.content;

    const answer =
      content.split('answer="')[1]?.split('"')[0] || "No title found";
    // ตรวจสอบคำตอบและคืนค่าผลลัพธ์
    console.log(`🐱 AI Response:`, answer);
    console.log(
      `🐱 Total Tokens Used: ${data.usage.total_tokens.toLocaleString()} token`
    );
    return answer.toLowerCase() === "yes";
  }

  // 📌 ฟังก์ชันตรวจสอบว่าภาพมีแมวหรือไม่
  async function checkCatWithGemini(imageUrl) {
    let models = [];
    if (select.value === "Automatic Model Selection") {
      models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
      ];
    } else {
      models = [select.value];
    }

    const shuffledModels = shuffleArray(models); // สุ่ม model ใหม่

    storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
    let attempts = 0;
    const maxAttempts = storedKeyss.length * models.length;
    let lastError = null;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const keyIndex = attempts % storedKeyss.length;
      const modelIndex =
        Math.floor(attempts / storedKeyss.length) % shuffledModels.length;

      const currentApiKey = storedKeyss[keyIndex];
      const currentModel = shuffledModels[modelIndex];
      //const currentModel = models[modelIndex];
      console.log(
        `🔑 Attempt ${attempts + 1}/${maxAttempts} - Using Key ${
          keyIndex + 1
        }/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`
      );

      updateStatusL(
        `🔑 Using API Key ${keyIndex + 1}/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`,
        "rgb(0, 0, 0)"
      );

      try {
        const ai = new GoogleGenAI({ apiKey: currentApiKey });

        // สมมติ userInput เป็น URL หรือ base64 ที่แปลงมาแล้ว
        // ถ้าเป็น URL ต้องแปลงเป็น base64 ก่อน (ฟังก์ชันนี้ต้องเขียนเพิ่มเอง)
        const imagePart = await urlToBase(imageUrl);

        // สร้างข้อความ systemInstruction
        const systemInstructionText = `You are an AI image analyzer. Look at the provided image and determine if it contains a cat. 
Respond strictly in the following format:
answer="Yes"   // if a cat is clearly present
answer="No"    // if no cat is present
Do not include any extra words, punctuation, or explanation.`;

        const promptText = `Analyze the attached image and respond strictly in one of the following formats:
answer="Yes" or answer="No" — Does the image contain a cat?`;
        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imagePart, // base64 string
                  mimeType: "image/png",
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ];

        const config = {
          maxOutputTokens: 2000,
          // temperature: 0.8,
          // topP: 0.95,
          systemInstruction: [{ text: systemInstructionText }],
        };

        if (currentModel != "gemini-1.5-flash") {
          config.mediaResolution = "MEDIA_RESOLUTION_LOW";
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          config,
          contents,
        });
        console.log(response.text);
        // ดึงผลลัพธ์ข้อความ
        const text = response.text ?? "No response";

        console.log("📌 Gemini API Response:");
        console.log(text);
        console.log("------------------------------------------------------");

        // ✅ 🔍 ดึงค่าที่ต้องการจากข้อความที่ตอบกลับมา
        const answerMatch = text.match(/answer="(Yes|No)"/);

        if (answerMatch) {
          console.log(`🐱 **Answer:** ${answerMatch[1]}`);
          await delay(2000);
          success = true; // ตั้งค่า success เป็น true เมื่อได้คำตอบที่ถูกต้อง
          return answerMatch[1] === "Yes"; // ✅ Return `true` ถ้ามีแมว, `false` ถ้าไม่มี
        } else {
          console.log("⚠️ ไม่พบคำตอบที่ถูกต้อง");
          await delay(2000);

          return false;
        }
      } catch (error) {
        console.error("❌ Error:", error.message);
        if (
          error.message.includes("429") ||
          error.message.includes("You exceeded your current quota") ||
          error.message.includes("current quota")
        ) {
          console.warn(
            `⚠️ Quota exceeded for this key. Rotating to the next key...`
          );
          attempts++;
          requestCounter++;
          lastError = error;
          await delay(timeoutInput.value * 1000); // รอ 1 วินาทีก่อนลองคีย์ถัดไป
        } else {
        }

        return false;
      }
    }
  }

  function getImageLink() {
    const imgElement = document.querySelector(
      'div[class^="Captionstyle__StyledImage"] img'
    );

    if (imgElement) {
      const imageUrl = imgElement.src;
      console.log("✅ ลิงก์รูปภาพ:", imageUrl);

      if (openAiRadio.checked) {
        checkCatWithGPT4oS(imageUrl);
      } else {
        describeImageWithGemini(imageUrl);
      }
    } else {
      console.log("❌- ไม่พบรูปภาพ");
      popupOverlay.style.display = "none";
      loader.style.display = "none";
      titles.style.display = "none";
      if (autoFullCheckbox.checked === true && chacknext === false) {
        setTimeout(navlink, 10000);
      }
    }
  }

  async function checkCatWithGPT4oS(imageUrl) {
    const apiKey = apiInput.value;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Briefly describe the content of this image in one short sentence.`,
              },
              {
                type: "image_url",
                image_url: {
                  detail: "low",
                  url: `${imageUrl}`,
                },
              },
            ],
          },
          {
            role: "system",
            content:
              'Respond strictly in the format: description="..." without any additional text or symbols.',
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    // รับข้อมูลจากการตอบกลับ
    const data = await response.json();
    const content = data.choices[0].message.content;

    const description =
      content.split('description="')[1]?.split('"')[0] || "No title found";
    // ตรวจสอบคำตอบและคืนค่าผลลัพธ์
    console.log(`🐱 AI Response:`, description);
    console.log(
      `🐱 Total Tokens Used: ${data.usage.total_tokens.toLocaleString()} token`
    );
    await delay(5000);

    // ค้นหาทุก textarea ที่มี class "_spectrum-Textfield-input_61339"
    const textareas = document.querySelector(
      'textarea[aria-label="Caption textarea"]'
    );
    const textareas2 = document.querySelector(
      'textarea[aria-label="ส่วนข้อความของคำบรรยาย"]'
    );
    // ตรวจสอบว่ามีมากกว่า 1 อันหรือไม่
    if (textareas) {
      // เลือกตัวที่ 2 (index เริ่มจาก 0)

      textareas.value = description;
      textareas.dispatchEvent(new Event("input", { bubbles: true }));

      console.log("✅ ใส่ข้อความลงใน textarea อันที่ 2 สำเร็จ!");
      setTimeout(clickCaptchaVerifyButton, 3000);
    } else {
      console.log("❌ ไม่พบ textarea อันที่ 2");
      if (textareas2) {
        textareas2.value = description;
        textareas2.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("✅ ใส่ข้อความลงใน textarea อันที่ 2 สำเร็จ!");
      }
    }
  }

  // 📌 ฟังก์ชันอธิบายภาพจาก URL
  async function describeImageWithGemini(imageUrl) {
    let models = [];
    if (select.value === "Automatic Model Selection") {
      models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-lite",
      ];
    } else {
      models = [select.value];
    }

    const shuffledModels = shuffleArray(models); // สุ่ม model ใหม่

    storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
    let attempts = 0;
    const maxAttempts = storedKeyss.length * models.length;
    let lastError = null;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const keyIndex = attempts % storedKeyss.length;
      const modelIndex =
        Math.floor(attempts / storedKeyss.length) % shuffledModels.length;

      const currentApiKey = storedKeyss[keyIndex];
      const currentModel = shuffledModels[modelIndex];
      //const currentModel = models[modelIndex];
      console.log(
        `🔑 Attempt ${attempts + 1}/${maxAttempts} - Using Key ${
          keyIndex + 1
        }/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`
      );

      updateStatusL(
        `🔑 Using API Key ${keyIndex + 1}/${
          storedKeyss.length
        } with Model "${currentModel}": ...${currentApiKey.slice(-8)}`,
        "rgb(0, 0, 0)"
      );

      try {
        const ai = new GoogleGenAI({ apiKey: currentApiKey });

        // สมมติ userInput เป็น URL หรือ base64 ที่แปลงมาแล้ว
        // ถ้าเป็น URL ต้องแปลงเป็น base64 ก่อน (ฟังก์ชันนี้ต้องเขียนเพิ่มเอง)
        const imagePart = await urlToBase(imageUrl);

        // สร้างข้อความ systemInstruction

        const promptText = `Briefly describe the content of this image in one short sentence.
                    Respond strictly in the format: description="..." without any additional text or symbols.`;
        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imagePart, // base64 string
                  mimeType: "image/png",
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ];

        const config = {
          maxOutputTokens: 2000,
          // temperature: 0.8,
          // topP: 0.95,
        };

        if (currentModel != "gemini-1.5-flash") {
          config.mediaResolution = "MEDIA_RESOLUTION_LOW";
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          config,
          contents,
        });
        console.log(response.text);
        // ดึงผลลัพธ์ข้อความ
        const text = response.text ?? "No response";

        console.log("📌 Gemini API Response:");
        console.log(text);
        console.log("------------------------------------------------------");

        // ✅ 🔍 ดึงคำอธิบายภาพจากข้อความที่ได้รับ
        const descriptionMatch = text.match(/description="(.*?)"/);

        await delay(5000);

        // ค้นหาทุก textarea ที่มี class "_spectrum-Textfield-input_61339"
        const textareas = document.querySelector(
          'textarea[aria-label="Caption textarea"]'
        );
        const textareas2 = document.querySelector(
          'textarea[aria-label="ส่วนข้อความของคำบรรยาย"]'
        );
        // ตรวจสอบว่ามีมากกว่า 1 อันหรือไม่
        if (textareas) {
          // เลือกตัวที่ 2 (index เริ่มจาก 0)

          textareas.value = descriptionMatch[1];
          textareas.dispatchEvent(new Event("input", { bubbles: true }));

          console.log("✅ ใส่ข้อความลงใน textarea อันที่ 2 สำเร็จ!");
          setTimeout(clickCaptchaVerifyButton, 3000);
        } else {
          console.log("❌ ไม่พบ textarea อันที่ 2");
          if (textareas2) {
            textareas2.value = descriptionMatch[1];
            textareas2.dispatchEvent(new Event("input", { bubbles: true }));
            console.log("✅ ใส่ข้อความลงใน textarea อันที่ 2 สำเร็จ!");
          }
        }

        if (descriptionMatch) {
          console.log(`🖼️ **Description:** ${descriptionMatch[1]}`);
          success = true;
          return descriptionMatch[1]; // ✅ คืนค่าคำอธิบายภาพ
        } else {
          console.log("⚠️ ไม่พบคำอธิบายภาพที่ถูกต้อง");
          return "No valid description found";
        }
      } catch (error) {
        console.error("❌ Error:", error.message);
        if (
          error.message.includes("429") ||
          error.message.includes("You exceeded your current quota") ||
          error.message.includes("current quota")
        ) {
          console.warn(
            `⚠️ Quota exceeded for this key. Rotating to the next key...`
          );
          attempts++;
          requestCounter++;
          lastError = error;
          await delay(timeoutInput.value * 1000); // รอ 1 วินาทีก่อนลองคีย์ถัดไป
        } else {
          // ถ้า error อื่น โยนกลับทันที
          //  console.error(`❌ Non-quota error, stopping retry: ${error.message}`);
          //throw error; // ⬅️ โยนกลับทันที หยุด loop
        }

        return "Error processing image";
      }
    }
  }

  function clickCaptchaVerifyButton() {
    const verifyButton = document.querySelector(
      'button[data-t="captcha-caption-continue"]'
    );

    if (verifyButton) {
      verifyButton.click();
      console.log("✅ คลิกปุ่ม 'Verify' สำเร็จ!");
      setTimeout(clickSubmitButtonss, 5000);
    } else {
      console.log("❌ ไม่พบปุ่ม 'Verify'");
    }
  }

  function clickSubmitButtonss() {
    const submitButton = document.querySelector(
      'button[data-t="send-moderation-button"]'
    );

    if (submitButton) {
      submitButton.click();
      console.log("✅ คลิกปุ่ม 'Submit' สำเร็จ!---");
    } else {
      console.log("❌ ไม่พบปุ่ม 'Submit'");
    }
    popupOverlay.style.display = "none";
    loader.style.display = "none";
    titles.style.display = "none";
    if (autoFullCheckbox.checked === true && chacknext === false) {
      setTimeout(navlink, 10000);
    }
  }

  async function navlink() {
    popupOverlay.style.display = "block";
    loader.style.display = "block";
    titles.innerText = "Wait a moment... The next batch is in progress";
    titles.style.display = "block";

    const link = document.querySelectorAll("a.nav__link.padding-bottom-medium");
    if (link.length > 0) {
      link[0].click();
      await delay(5000);
      await buttonCheckbox();
      await delay(5000);
      if (document.querySelector(".button.button--action.center-align")) {
        console.log("พบปุ่มที่ต้องการ!");

        autoButton.click();
      } else {
        console.log("ไม่พบปุ่มที่ต้องการ!");
        popupOverlay.style.display = "none";
        loader.style.display = "none";
        titles.style.display = "none";
      }
    } else {
      console.log("ไม่พบลิงก์ที่ต้องการกด");
    }
  }

  ////////////////////////////////////////////////////////////////////////
  // สร้างปุ่ม
  // เลือก elements ทั้งหมดที่ตรงกับตัวเลือก

  document.addEventListener("click", (event) => {
    const clickedImg = event.target.closest(".upload-tile__wrapper img");
    if (clickedImg) {
      const containerKeywords = document.querySelector("#keywords-container");

      if (containerKeywords) {
        console.log("รูปที่ถูกกด:", clickedImg.src);
        isRarkKeywords = false;
        containerKeyword.remove();
      }
    }
  });

  let containerKeyword;
  let mainContainer;
  // สร้าง container หลักที่ครอบปุ่มทั้งหมด
  mainContainer = document.createElement("div");
  mainContainer.id = "main-keywords-container";
  Object.assign(mainContainer.style, {
    position: "relative",
    width: "100%",
    padding: "1px",
    marginTop: "10px",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    marginBottom: "10px",
  });

  const observer = new MutationObserver(() => {
    const panelContents = document.querySelector(
      ".margin-bottom-xsmall.clear-fix.container-full"
    );
    if (panelContents) {
      panelContents.prepend(mainContainer);
      observer.disconnect(); // หยุดฟังเมื่อเจอ element แล้ว
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const button = document.createElement("button");
  button.textContent = "Keywords Edit (Rark)"; // ข้อความบนปุ่ม

  // สไตล์ปุ่ม
  button.style.position = "relative"; // กำหนด position เป็น relative
  button.style.padding = "10px 20px"; // กำหนด padding
  button.style.fontSize = "16px"; // ขนาดตัวอักษร
  button.style.border = "none"; // ไม่มีขอบ
  button.style.width = "100%"; // กำหนดความกว้าง
  button.style.borderRadius = "10px"; // มุมโค้งมน
  button.style.backgroundColor = "rgb(0, 0, 0)"; // สีพื้นหลัง
  button.style.color = "white"; // สีตัวอักษร
  button.style.cursor = "pointer"; // ทำให้เมาส์เป็น pointer เมื่อโฮเวอร์
  button.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)"; // เงาเบาๆ
  button.title =
    "แก้ไขคำสำคัญ แสดงลำดับแถบสีและสามารถย้ายลำดับได้\nEdit keywords, display color order, and rearrange positions.";

  // เพิ่มปุ่มลงใน body
  mainContainer.appendChild(button);

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "rgb(65, 65, 65)";
  });
  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "rgb(0, 0, 0)";
  });

  button.addEventListener("click", async () => {
    if (isRarkKeywords) {
      isRarkKeywords = false;
      containerKeyword.remove();
    } else {
      isRarkKeywords = true;

      // ดึง element ของ textarea
      const textarea = document.getElementById("content-keywords-ui-textarea");
      // ดึงข้อความและแปลงเป็น array โดยแยกด้วย ", "
      const inputKeywords = textarea.value
        .split(",")
        .map((keyword) => keyword.trim());
      // เรียกใช้ API และรอผลลัพธ์
      const keywords = await fetchKeywordss(inputKeywords);
      // ส่งค่าที่ได้ไปแสดงผลใน UI
      checkContainer(keywords);
    }
  });

  async function fetchKeywordss(keywordsArray) {
    console.log("keywordsArray_fetchKeywords-----------:", keywordsArray);
    const url = "https://api.imstocker.com/api/keyword/getKeywordsByTitles";

    const requestBody = {
      title_keywords: keywordsArray,
      target: "site",
      id_language: "1",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // ตรวจสอบข้อมูลที่ได้จาก API
      console.log("API Response:", data);

      // ตรวจสอบว่า data.res เป็นอาร์เรย์ไหม
      if (!Array.isArray(data.res)) {
        throw new Error(
          "Unexpected API response format: 'res' is not an array"
        );
      }

      // สร้าง object map ของ keywordsArray เพื่อใช้จับคู่กับผลลัพธ์จาก API
      const keywordsMap = new Map(
        keywordsArray.map((keyword, index) => [keyword, index])
      );

      // จับคู่คำที่ได้รับจาก API กับ keywordsArray ตามลำดับ
      const result = data.res.map((item) => ({
        text: item.title_keyword,
        rank: item.result_rank,
        originalIndex: keywordsMap.get(item.title_keyword), // หาลำดับจาก keywordsArray
      }));

      // เรียงผลลัพธ์ตามลำดับของ keywordsArray
      const sortedResult = result.sort(
        (a, b) => a.originalIndex - b.originalIndex
      );

      // คืนค่า sortedResult ที่เรียงตามลำดับเดิมของ keywordsArray
      return sortedResult.map((item) => ({
        text: item.text,
        rank: item.rank,
      }));
    } catch (error) {
      console.error("Error fetching keywords:", error);
      return keywordsArray.map((keyword) => ({ text: keyword, rank: "N/A" })); // คืนค่าเดิมถ้า API ล้มเหลว
    }
  }

  async function checkContainer(keywords) {
    console.log("content.js loaded", keywords);
    if (document.getElementById("keywords-container")) return;

    // ✅ 1. สร้างกล่อง UI หลัก
    containerKeyword = document.createElement("div");
    containerKeyword.id = "keywords-container";
    Object.assign(containerKeyword.style, {
      position: "relative",
      width: "100%",
      background: "#fff",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
    });

    // ✅ 2. สร้างปุ่ม "รีเฟรช" ที่มุมขวาบน
    const refreshButton = document.createElement("button");
    refreshButton.textContent = "⟳"; // ใช้สัญลักษณ์ รีเฟรช
    refreshButton.style.position = "absolute";
    refreshButton.style.top = "5px";
    refreshButton.style.right = "5px";
    refreshButton.style.fontSize = "20px";
    refreshButton.style.background = "transparent";
    refreshButton.style.border = "none";
    refreshButton.style.cursor = "pointer";
    refreshButton.style.color = "black"; // เปลี่ยนเป็นสีน้ำเงิน
    refreshButton.style.padding = "0";
    refreshButton.style.margin = "0";
    refreshButton.style.lineHeight = "1";

    // ✅ เมื่อคลิกปุ่ม "รีเฟรช" ให้โหลดข้อมูลใหม่
    refreshButton.addEventListener("click", async function () {
      // ลบ UI เก่า
      containerKeyword.remove();

      // โหลด UI ใหม่
      const textarea = document.getElementById("content-keywords-ui-textarea");
      const inputKeywords = textarea.value
        .split(",")
        .map((keyword) => keyword.trim());
      const keywords = await fetchKeywordss(inputKeywords);
      checkContainer(keywords); // เรียกสร้าง UI ใหม่
    });

    containerKeyword.appendChild(refreshButton);

    // ✅ 2. สร้างหัวข้อ
    const title = document.createElement("p");
    title.textContent = `Your Keywords (${keywords.length})`;
    title.style.margin = "0 0 10px";
    title.style.fontWeight = "bold";
    containerKeyword.appendChild(title);

    // ✅ 3. สร้างกล่องเก็บคำสำคัญ
    const keywordsList = document.createElement("div");
    keywordsList.id = "keywords-list";
    Object.assign(keywordsList.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "5px",
      minHeight: "50px",
      padding: "10px",
      background: "#f5f5f5",
      borderRadius: "5px",
    });

    // ✅ 4. เพิ่มคำสำคัญลงในกล่อง พร้อมปุ่มลบ
    keywords.forEach(({ text, rank }) => {
      // แปลง rank เป็นเปอร์เซ็นต์ (ไม่มีทศนิยม)
      const rankPercentage = Math.round(parseFloat(rank) * 100);

      const keywordItem = document.createElement("span");
      keywordItem.textContent = `${text} (${rankPercentage}%)`; // แสดง title_keyword และ result_rank
      Object.assign(keywordItem.style, {
        display: "inline-block",
        padding: "2px 2px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "grab",
        userSelect: "none",
        color: " #000",
        border: "1px solid #ccc",
        margin: "1px",
      });
      keywordItem.style.background = getColor(rank);

      // ✅ สร้างปุ่ม x เพื่อให้ลบคำออก
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "x";
      deleteButton.style.padding = "0 2px";
      deleteButton.style.fontSize = "12px";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.marginLeft = "2px";
      deleteButton.style.border = "none";
      deleteButton.style.background = "transparent";
      deleteButton.style.color = "red";

      // ✅ เมื่อคลิกปุ่ม x ลบคำออกจากรายการ
      deleteButton.addEventListener("click", function () {
        keywordItem.remove();
        updateTextarea(keywordsList);
      });

      keywordItem.appendChild(deleteButton);
      keywordsList.appendChild(keywordItem);
    });

    // ✅ ฟังก์ชันกำหนดสีตาม rank
    function getColor(rank) {
      const rankValue = parseFloat(rank);
      if (rankValue >= 0.8) return " #d3a3ff"; // สีฟ้า (สูง)
      if (rankValue >= 0.6) return " #a3c3ff"; // สีม่วง (ปานกลาง)
      if (rankValue >= 0.4) return "rgb(153, 255, 158)"; // สีเหลือง (ต่ำ)
      if (rankValue >= 0.3) return "rgb(248, 255, 153)"; // สีเหลือง (ต่ำ)
      if (rankValue >= 0.1) return "#cccccc"; // สีเหลือง (ต่ำ)
      return "rgb(255, 255, 255)"; // สีเทา (ต่ำมาก)
    }

    containerKeyword.appendChild(keywordsList);

    // ✅ สร้างปุ่มสำหรับนำข้อมูลไปใส่ใน textarea
    const button = document.createElement("button");
    button.textContent = "Update Keywords to Textarea";
    button.style.padding = "10px";
    button.style.width = "100%";
    button.style.marginTop = "10px";
    button.style.cursor = "pointer";
    button.style.border = "2px solid  rgb(0, 0, 0)";
    button.style.borderRadius = "5px";
    button.style.backgroundColor = "rgb(255, 255, 255)";
    button.style.color = "black";
    containerKeyword.appendChild(button);

    // ✅ ฟังก์ชันที่ใช้เมื่อคลิกปุ่ม
    button.addEventListener("click", function () {
      updateTextarea(keywordsList);
    });
    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = "rgb(0, 0, 0)";
      button.style.color = "white";
    });
    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = "rgb(255, 255, 255)";
      button.style.color = "black";
    });

    mainContainer.appendChild(containerKeyword);
    // ✅ แทรก UI เข้าไปใน `.panel-content`
    // const panelContents = document.querySelector(
    //   ".margin-bottom-xsmall.clear-fix.container-full"
    // );

    ///if (panelContents) {
    // panelContents.appendChild(containerKeyword);
    //} else {
    // console.warn("ไม่พบ element ที่มี class 'panel-content'");
    //}

    // ✅ 6. ใช้ SortableJS ให้ลากเรียงใหม่ได้
    new Sortable(keywordsList, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      // onEnd: function (evt) {
      // เมื่อการลากเสร็จสิ้น ให้ดึงข้อมูลจาก keywordsList และอัปเดตใน textarea
      //   updateTextarea(keywordsList);
      //  },
    });

    // ฟังก์ชันสำหรับอัปเดต textarea
    function updateTextarea(keywordsList) {
      // ดึงข้อมูลจาก keywordsList
      const sortedKeywords = Array.from(keywordsList.children)
        .map((item) => item.textContent.split(" (")[0]) // ดึงแค่ text ไม่เอา (rank)
        .join(", ");

      // อัปเดตค่าใน textarea
      const keywordsTextarea = document.querySelector(
        "#content-keywords-ui-textarea"
      );
      if (keywordsTextarea) {
        keywordsTextarea.value = sortedKeywords;
        keywordsTextarea.dispatchEvent(new Event("input", { bubbles: true }));
        //keywordsTextarea.focus();
      } else {
        console.log("ไม่พบ textarea (Paste Keywords...)");
      }
    }
  }

  async function insertAdIframe() {
    // ถ้ามีโฆษณาอยู่แล้ว ให้ return ออกไป
    if (document.getElementById("floating-ad-container")) return;

    // สร้าง Container สำหรับโฆษณา
    let adContainer = document.createElement("div");
    adContainer.id = "floating-ad-container";
    Object.assign(adContainer.style, {
      position: "fixed",
      bottom: "100px",
      right: "30px",
      width: "350px",
      height: "500px",
      background: "rgb(0, 0, 0)",
      border: "1px solid #000000",
      boxShadow: "0px 4px 6px #000000",
      borderRadius: "10px",
      zIndex: "9000",
      //padding: "10px",
      paddingTop: "32px",
      textAlign: "center",
      opacity: "1",
      transition: "opacity 0.5s",
    });

    // ปุ่มปิด
    let closeButton = document.createElement("div");
    closeButton.innerHTML = "❌";
    Object.assign(closeButton.style, {
      position: "absolute",
      top: "5px",
      right: "10px",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold",
      zIndex: "9001",
    });

    closeButton.onclick = () => {
      adContainer.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(adContainer)) {
          document.body.removeChild(adContainer);
        }
      }, 500);
    };

    // โหลด iframe
    let adIframe = document.createElement("iframe");
    adIframe.src =
      "https://www.canva.com/design/DAGs1jFo2m8/7OLPDIJv-PaSvPym-oIWqQ/view?embed"; // เปลี่ยนตามต้องการ
    Object.assign(adIframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      //borderRadius: "10px"
    });

    // ใส่ปุ่มและ iframe ลง container
    adContainer.appendChild(closeButton);
    adContainer.appendChild(adIframe);
    document.body.appendChild(adContainer);

    // ปิดอัตโนมัติหลัง 30 วิ
    await delay(60000000);
    if (document.body.contains(adContainer)) {
      adContainer.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(adContainer)) {
          document.body.removeChild(adContainer);
        }
      }, 500);
    }
  }

  // เรียกเมื่อโหลดหน้าเสร็จ
  window.addEventListener("load", () => {
    insertAdIframe();
  });
})();
