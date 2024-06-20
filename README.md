# CS348-Group21

Figma link (design will be updated for each milestone): 

https://www.figma.com/design/2SqR3fiXOo7O1gCOu5KLK7/poker-replay?node-id=0-1&t=ln2VSweIvejDPM7F-1

# Setup for bash scripts (Not required)

This adds some convenience functions to your shell. If you don't want to use them, you can skip this step.


To run these the cs348 db must be setup. Look at the README in the `backend/sql` directory for more information.

Edit your shell profile (~/.bashrc for Bash, ~/.zshrc for Zsh):

```bash
export POKER_REPLAY_ROOT=$HOME:/path/to/poker-replay
```

Then add the following to the end of the file:

```bash
source $POKER_REPLAY_ROOT/shell_commands.sh
```

Then source the profile:

```bash
source ~/.zshrc
```

Usage:

- Drop Tables: `drop_tables`
- Create Tables: `create_tables`
- Load Data: `load_data`
