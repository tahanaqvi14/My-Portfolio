import { create } from "zustand";

const Store = create((set) => ({
  card: 1, // Initial card state
  setcard: (newcardname) => set({ card: newcardname }), // Set card manually

  message: "", // Initial message state
  setmessage: (newMessage) => set({ message: newMessage }) // Set message manually
  ,
  showAbout: false,
  setShowAbout: (value) => set({ showAbout: value }), // true or false
  toggleShowAbout: () => set((state) => ({ showAbout: !state.showAbout })),

  cameBackFromLastPage: false,
  setCameBackFromLastPage: (value) => set({ cameBackFromLastPage: value }),


}));

export default Store;




