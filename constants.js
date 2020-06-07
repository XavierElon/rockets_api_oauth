module.exports = {
    BAD_REQUEST: 'The request object is missing atleast one of the required attributes',
    UNAUTHORIZED: 'Invalid/missing JWT',
    NOT_ACCEPTABLE: 'Accept header does not accept application/json',
    FORBIDDEN: 'This rocket is owned by someone else',
    NOT_ALLOWED: 'Allow header must be aplication/json',
    NOT_FOUND: 'An entity with this id does not exist'
}