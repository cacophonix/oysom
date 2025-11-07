# 🔐 GitHub Multi-Account SSH Setup Guide

This guide explains how to fix `Permission denied` errors when working with multiple GitHub accounts (e.g., `oysom` and `cacophonix`) on the same machine.

---

## 🧭 1. Problem

When you have multiple GitHub accounts, Git may use the wrong SSH key, leading to:
ERROR: Permission to cacophonix/oysom.git denied to oysom.

yaml
Copy code

---

## ⚙️ 2. SSH Configuration

Create or edit your SSH config file:

```bash
nano ~/.ssh/config
Add entries for each GitHub account:

text
Copy code
Host github-oysom
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_oysom

Host github-cacophonix
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_cacophonix
Host → nickname for the GitHub account.

IdentityFile → private key file for that account.

Each private key must have a corresponding public key (.pub) added to GitHub under Settings → SSH and GPG keys.

🔁 3. Updating Your Repository Remote
Check the current remote:

bash
Copy code
git remote -v
Update it to use the correct host alias (example for cacophonix):

bash
Copy code
git remote set-url origin git@github-cacophonix:cacophonix/oysom.git
Then test your SSH identity:

bash
Copy code
ssh -T git@github-cacophonix
Expected output:

rust
Copy code
Hi cacophonix! You've successfully authenticated...
Finally, push:

bash
Copy code
git push origin main
🧩 4. For oysom Projects
Do the same, but with your other host alias:

bash
Copy code
git remote set-url origin git@github-oysom:oysom/another-repo.git
💡 5. Tips & Best Practices
Use Case	Recommendation
Multiple GitHub accounts	Use separate SSH keys & host aliases
Need simplicity	Use HTTPS + Personal Access Token
Debug identity issues	Run ssh -T git@github.com
Check current remote	Run git remote -v

🧰 Example Summary
Account	Host Alias	SSH Key	Example Remote
oysom	github-oysom	~/.ssh/id_rsa_oysom	git@github-oysom:oysom/repo.git
cacophonix	github-cacophonix	~/.ssh/id_rsa_cacophonix	git@github-cacophonix:cacophonix/repo.git