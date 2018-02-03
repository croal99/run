import * as types from './mutation-type.js';
  
export default{  
    showloader:({ commit }) => {  
        commit( types.SHOWLOADING );
    },  
    hideloader:({ commit }) => {  
        commit( types.HIDELOADING );
    },
    set_coords:({ commit }, coords) => {  
        commit( types.SET_COORDS, coords );
    },
};