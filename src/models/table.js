export default {
  namespace: 'table',
  state: {
    bodyHeight: null,
    contentHeight: null,
  },
  reducers: {
    save(_, { payload }) {
      return {
        ...payload,
      };
    },
  },
};
