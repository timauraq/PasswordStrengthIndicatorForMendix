# Password Strength Indicator for Mendix

This widget wraps up the [jQuery Password Strength Meter for Twitter Bootstrap](https://github.com/ablanco/jquery.pwstrength.bootstrap) library allowing the user to see the strength of their password as they are creating it.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Typical usage scenario

Where a user has to specify a new password and wishes to see its strength in line with their Mendix project password policy settings.

# Configuration

## Data Source

- Password: The new password string attribute.

## Options

- Minimum password length: The minimum number of characters permissible in the password.
- Requires digit: Whether the password must contain a digit character.
- Requires mixed case: Whether the password must contain lower and upper case letters.
- Requires symbol: Whether the password must contain a symbol character.

## Messages

- No digit message: Translatable error message if a digit is not supplied.
- No mixed case message: Translatable error message if both upper and lower cases are not present.
- No symbol message: Translatable error message if a symbol is not supplied.
- Word length message: Translatable error message if password is too short.
- Word repetitions message: Translatable error message if password contains repetitions.
- Word sequences message: Translatable error message if password contains sequences.

## On change

- On change microflow: The microflow executed when a user enters or removes characters within the field.
