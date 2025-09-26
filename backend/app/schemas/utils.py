def to_camel(string: str) -> str:
    """Convert a snake_case string to camelCase.

    This function is particularly useful when working with Pydantic models,
    where you may want to transform field names from Python's snake_case
    convention to camelCase for JSON serialization. For example, APIs often
    use camelCase for field names in their payloads, and this function can
    be used to customize the `alias_generator` in Pydantic schemas.

    Parameters
    ----------
    string : str
        The input string in snake_case format.

    Returns
    -------
    str
        The converted string in camelCase format.

    Examples
    --------
    >>> to_camel("example_string")
    'exampleString'
    >>> to_camel("another_example")
    'anotherExample'

    Usage in Pydantic
    -----------------
    You can use this function as the `alias_generator` in a Pydantic model
    to automatically convert field names to camelCase during JSON serialization:

    >>> from pydantic import BaseModel
    >>> class ExampleModel(BaseModel):
    ...     example_field: str
    ...     another_field: int
    ...
    ...     class Config:
    ...         alias_generator = to_camel
    ...         allow_population_by_field_name = True
    >>> model = ExampleModel(example_field="value", another_field=42)
    >>> model.dict(by_alias=True)
    {'exampleField': 'value', 'anotherField': 42}
    """

    parts = string.split("_")

    return parts[0] + "".join(word.capitalize() for word in parts[1:])
