//Configurations/ — database mapping rules (schema shaping)
// Why separate from logic?
// Because it’s not business logic. It’s storage logic.
// Domain says: “Username cannot be empty.”
// Configuration says: “Username column max length 50.”
// Those are different kinds of rules:
// Domain rules protect correctness
// DB rules protect data integrity and performance