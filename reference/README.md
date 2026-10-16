# /reference

Read-only reference repos for the mock test engine. Antigravity should READ these
for ideas (timer, autosave, question schema, validation CI) and NOT copy code
verbatim. Check each repo's license before reusing anything.

| Folder        | Repo                         | Study this for                                              |
|---------------|------------------------------|-------------------------------------------------------------|
| mock-test     | the-lust/mock-test           | exam config JSON, autosave + crash recovery, question validation CI |
| cbt-system    | cssadewale/cbt-system        | CSV question format, randomisation, teacher/student portals, tab-switch detection |
| cissp-study   | xcode96/ISC2                 | practice modes, question tracking (no repeats), custom quizzes |
| cbt-basic     | Petec0x0/cbt                 | simple baseline CBT flow                                    |

## Setup
- macOS/Linux/WSL: `bash clone.sh`
- Windows PowerShell: `./clone.ps1`

Cloned folders are git-ignored by your main project (see .gitignore here).
