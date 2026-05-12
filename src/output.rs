use crossterm::{
    execute,
    style::{Color, Print, ResetColor, SetForegroundColor},
};
use std::io::stdout;

/// Print a green success message prefixed with ✓.
pub fn print_success(msg: &str) {
    let _ = execute!(
        stdout(),
        SetForegroundColor(Color::Green),
        Print("✓ "),
        ResetColor,
        Print(msg),
        Print("\n"),
    );
}

/// Print a yellow warning message prefixed with ⚠.
pub fn print_warn(msg: &str) {
    let _ = execute!(
        stdout(),
        SetForegroundColor(Color::Yellow),
        Print("⚠ "),
        ResetColor,
        Print(msg),
        Print("\n"),
    );
}

/// Print a red error message prefixed with ✗.
pub fn print_error(msg: &str) {
    let _ = execute!(
        stdout(),
        SetForegroundColor(Color::Red),
        Print("✗ "),
        ResetColor,
        Print(msg),
        Print("\n"),
    );
}

/// Print a cyan informational message prefixed with ℹ.
pub fn print_info(msg: &str) {
    let _ = execute!(
        stdout(),
        SetForegroundColor(Color::Cyan),
        Print("ℹ "),
        ResetColor,
        Print(msg),
        Print("\n"),
    );
}
