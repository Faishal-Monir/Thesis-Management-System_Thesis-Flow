GIT_BASH_EXE="/c/Program Files/Git/git-bash.exe"

"$GIT_BASH_EXE" -i -l -c "cd \"$(pwd)/backend\" && node index.js" &
"$GIT_BASH_EXE" -i -l -c "cd \"$(pwd)/frontend\" && npm start" &

echo "Launched Backend and Frontend in separate Git Bash terminals."
read -rp "Press Enter to exit this launcher..."
