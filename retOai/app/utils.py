from bson import ObjectId


def to_str_id(value) -> str:
    return str(value)


def to_object_id(value) -> ObjectId:
    return ObjectId(value)
