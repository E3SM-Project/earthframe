from pydantic import BaseModel, ConfigDict

from app.schemas.utils import to_camel_case


class CamelInModel(BaseModel):
    # Requests: only accept camelCase
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=False,  # camelCase-only input
        from_attributes=False,  # not needed for requests
    )


class CamelOutModel(BaseModel):
    # Responses: read from ORM attributes (snake_case)
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,  # allow population by field name
        from_attributes=True,  # ORM objects
    )
