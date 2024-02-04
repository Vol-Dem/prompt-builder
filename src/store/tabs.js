import { createSlice } from "@reduxjs/toolkit";
import { get, onValue, ref, set } from "firebase/database";
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "../firebase-config";

const firestore = getFirestore(firebaseApp);

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    currTab: "",
    currCategory: "",
    currSubcategory: "",
    allCategories: [],
    categoriesData: "",
    modelsData: [],
    subcategories: [],
  },
  reducers: {
    setCurrentTab(state, actions) {
      state.currTab = actions.payload;
    },
    setCurrentCategory(state, actions) {
      state.currCategory = actions.payload;
    },
    setCurrentSubcategory(state, actions) {
      state.currSubcategory = actions.payload;
    },
    setCategories(state, actions) {
      console.log(actions.payload);
      state.categoriesData = actions.payload;
    },
    setModelsData(state, actions) {
      console.log(actions.payload);
      state.modelsData = actions.payload;
    },
    setSubcategories(state, actions) {
      state.subcategories = actions.payload;
    },
    // setAllCategories(state, actions) {
    //   state.allCategories = actions.payload;
    // },
    reset(state, actions) {
      //   state.currTab = "";
      state.currCategory = "";
      state.currSubcategory = "";
      state.categoriesData = [];
      state.subcategories = [];
    },
  },
});

export const getCategories = (uid) => {
  return async (dispatch) => {
    // const userRef = doc(firestore, "users", uid);

    const unsub = onSnapshot(doc(firestore, "users", uid), (doc) => {
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source);
      const data = doc.data();
      console.log(data?.categories);
      dispatch(tabActions.setCategories(data?.categories));
    });

    // const userSnap = await getDoc(userRef);
    // if (userSnap.exists()) {
    //   const data = userSnap.data();
    //   console.log(data.categories);
    //   dispatch(tabActions.setCategories(data.categories));
    // }
  };
};

// export const getModelsPreview = (uid) => {
//   return async (dispatch) => {
//     const q = query(
//       collection(firestore, "users", uid, "models preview"),
//       where("main", "==", activeCategory),
//       where("sub", "array-contains", e.target.id)
//     );
//     const querySnapshot = await getDocs(q);
//     const modelsData = querySnapshot.docs.map((doc) => {
//       // doc.data() is never undefined for query doc snapshots
//       return doc.data();
//     });
//     console.log(activeCategory, activeSubcategory);
//     console.log(modelsData);
//     dispatch(tabActions.setModelsData(modelsData));
//   };
// };

export const tabActions = tabsSlice.actions;

export default tabsSlice;
