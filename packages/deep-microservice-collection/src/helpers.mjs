const validString = (val) => {
    return !!val && (typeof val === 'string');
};

export { validString };