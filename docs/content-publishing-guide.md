# Publishing a new note

1. Choose a short descriptive title and URL-safe filename.
2. Add the new page under `notes/`, following the existing HTML structure and navigation.
3. Register the page in the homepage `index.html` notes index.
4. Check the page on desktop and mobile, including the left navigation, dark mode, links and readability.
5. Review spelling and accessibility: descriptive link text, heading hierarchy and alt text for meaningful images.
6. Confirm that all links work after GitHub Pages deployment.

## Privacy before publishing

- Do not publish internal customer names, site diagrams, credentials, server IPs, confidential logs or source code.
- Remove personal addresses, private phone numbers and metadata from screenshots.
- Prefer anonymized examples when describing work incidents.
- Check commit diffs, not only the final page: Git history can preserve removed secrets.

## Release check

Verify the configured custom domain, HTTPS, and latest GitHub Pages workflow. If the deployment fails, read the workflow logs before retrying. A GitHub Pages backend error does not necessarily mean the HTML build failed.
