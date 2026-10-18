@AGENTS.md

<!-- 守則正本是 AGENTS.md。這份只放 Claude Code 專屬的部分,
     不要在這裡重複 AGENTS.md 的內容 —— 同一件事寫在兩處會慢慢分岔。 -->

## Claude Code 專屬

- 回填文件用 `/doc-sync`。收工檢查(Stop hook)擋下時也是跑它。
- `doc/DESIGN.md` 的寫入會跳確認框(`.claude/settings.json` 的 `permissions.ask`,任何權限模式都繞不過)。
  **那一框就是 Chiao 的裁決點** —— 不要自己想辦法繞過去,也不要改用 shell 寫入。
