# Worklog

1. Coming up with the name: https://claude.ai/share/f0907f69-3e2b-4947-b88b-7174a7491664
2. Creating the design: https://claude.ai/share/54f339ad-bf69-4095-a67d-6be50f90fedc
3. Claude Artifact: https://claude.ai/public/artifacts/e1aeb13b-1341-4adb-ab7c-f1fef9b35b80
4. Manually scaffolded the Vue app using `npm create vite@latest . -- --template vue-ts`
5. Created initial working version of the app: https://opncd.ai/share/W3d6OPwz
6. Mistake: Tried adding in some ugly "Hacker news" if statements to handle formatting exceptions. Did a rollback on the changes.
7. Added greyed out visited links using opencode
8. Moved to tailwind CSS using opencode to do the refactor
9. Manually added smart defaults for feeds of authors that I commonly read
10. Used opencode to plan a share feature which allows users to send a shareable link of their feeds to friends. When the friends open the link, they will see the shared feed along with options to import any or all of the feeds shared into their own. The feeds are encoded in the share link: https://opncd.ai/share/CeYjnfcw
11. Deployed to vercel using opencode to guide. Worked well but found a limitation of the CORS proxy services that I was using.
12. Found an issue where `corsproxy.io` is limited to development, had to pay for API key to use in production. Created a Vercel serverless function to proxy RSS feed requests through it instead but got caught up on getting the vercel dev environment playing nicely with the Vite dev server for serving the frontend locally. Opted instead to use `corsproxy.io` in dev environment: https://opncd.ai/share/tIVeUpFE. Not the best solution but it works.
13. Updated the favicon. Had to do a few iterations to get the colour scheme and style to match what I wanted: https://opncd.ai/share/pVRh72gO
14. Found some responsiveness issues with the share screen. Found that it struggled making the correct CSS changes to fix the issue. Had to manually fix the issue: https://opncd.ai/share/9L5IHjBN
