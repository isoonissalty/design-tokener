## 2025-02-17 - [Redux Toolkit Immer Snapshotting]
**Learning:** `JSON.parse(JSON.stringify(state))` is a significant bottleneck in Redux reducers for history management, especially with large state trees. Redux Toolkit's `current()` creates a structural snapshot much faster (~20x faster in benchmarks).
**Action:** Always use `current()` for snapshotting Immer drafts instead of deep cloning, unless you specifically need to break all references for some edge case.
