# GresstApp

GresstApp is a mobile application developed using **Node.js**, **TypeScript**, **Angular**, and **Ionic**. It is designed to run on both iOS and Android devices, leveraging **Capacitor** to access native functionalities.

## Author

**Gresst SAS - Edisson Fonseca**  
[https://gresst.com/](https://gresst.com/)

## Documentation

This project includes comprehensive documentation:

- [Technical Documentation](DOCUMENTATION.md) - For developers and technical contributors
- [User Guide](USER_GUIDE.md) - For end users and administrators

## Description

GresstApp combines modern technologies to provide a seamless and fast mobile experience. The project includes features such as local storage, camera access, geolocation, and more.

---

## Technologies Used

- **Angular 17**: Main framework for web development.
- **Ionic 8**: Framework for building hybrid mobile applications.
- **Capacitor 6**: Integration for native functionalities on iOS and Android.
- **TypeScript**: Primary language used for the project.

---

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (Recommended version: 18 or higher)
- **NPM** or **Yarn**
- **Ionic CLI**:  
  ```bash
  npm install -g @ionic/cli

#Clone the Repository
git clone https://github.com/your-user/gresstapp.git
cd gresstapp

#Install Dependencies
npm install

Mobile Development
Capacitor Setup
Synchronize Capacitor with native platforms:

bash
Copiar código
npx cap sync
Open the project in the appropriate IDE:

Android:
bash
Copiar código
npx cap open android
iOS:
bash
Copiar código
npx cap open ios
Key Dependencies
Production
@angular/core: Angular core framework.
@ionic/angular: Ionic and Angular integration.
@capacitor/core: Capacitor core for native functions.
@capacitor/geolocation: Plugin for accessing geolocation.
@capacitor/camera: Plugin for accessing the device camera.
Development
@angular-eslint: Linter for Angular with TypeScript support.
Karma: Tool for running unit tests.
TypeScript: Primary programming language of the project.
Reinstalling Dependencies
If you encounter dependency issues, you can clean and reinstall:

##Remove installed modules:

rm -rf node_modules package-lock.json

bash
Copiar código
npm cache clean --force
Reinstall dependencies:

bash
Copiar código
npm install
Resynchronize Capacitor:

bash
Copiar código
npx cap sync
Production Deployment
Build the application:

bash
Copiar código
npm run build
Copy the generated files to native platforms:

bash
Copy code
npx cap copy
Compile and distribute the app using Android Studio or Xcode.

Contributing
Contributions are welcome. Please open an issue or submit a pull request for any improvements or bug fixes.

License
This project is owned by Gresst SAS. All rights reserved.
