# Contributing to CivicEcho

Thank you for your interest in contributing to **CivicEcho**! We welcome and appreciate contributions from developers of all skill levels to help build better civic tools for everyone.

By contributing to this project, you agree to abide by our guidelines and help maintain a welcoming, professional, and collaborative community.

---

## 🗺️ How Can I Contribute?

### 1. Reporting Bugs 🐛
If you find a bug in the application, please open an issue on GitHub. Include:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Your browser and device details.
- Screenshots or video recordings if applicable.

### 2. Suggesting Features 💡
Have an idea to make CivicEcho even better? We love feature suggestions! When opening a feature request, please describe:
- The problem your feature solves.
- What the proposed solution looks like.
- Any alternative options you've considered.

### 3. Submitting Pull Requests 🚀
To contribute code, bug fixes, or new features directly:

1. **Fork the Repository:** Create a personal copy of the repository on your GitHub account.
2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/online-complaint-registration.git
   cd online-complaint-registration
   ```
3. **Create a Branch:** Create a branch for your work (use a descriptive name starting with `feature/` or `bugfix/`):
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
4. **Install Dependencies & Set Up Environment:**
   ```bash
   npm install
   cp .env.example .env
   ```
5. **Write Code & Make Changes:** Follow our coding styles (TypeScript, Tailwind, React Hooks, and modular component design).
6. **Lint & Test Your Changes:** Make sure there are no syntax or build errors before pushing:
   ```bash
   npm run build
   ```
7. **Commit Your Changes:** Write descriptive, imperative commit messages:
   ```bash
   git commit -m "Add custom notification support to ComplaintDetails component"
   ```
8. **Push to Your Fork:**
   ```bash
   git push origin feature/your-awesome-feature
   ```
9. **Submit a Pull Request:** Navigate to the original repository and click **Compare & pull request**. Provide a clear explanation of what your changes accomplish.

---

## 🎨 Code Style & Quality Standards

- **TypeScript:** Keep your code fully typed. Avoid using `any` whenever possible.
- **Tailwind CSS v4:** Keep styling modular, highly responsive, and aligned with standard spacing and negative boundaries.
- **Components:** Place new components in `/src/components` and export them modularly. Avoid consolidating too much logic in a single file like `App.tsx`.
- **Accessibility:** Ensure high color contrast, readable text sizes, and appropriate keyboard focus styling.

---

## 🛡️ Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for all. Please be respectful, constructive, and collaborative in all issues, pull requests, and discussions.

Thank you for helping us build better civic software! 🏛️❤️
