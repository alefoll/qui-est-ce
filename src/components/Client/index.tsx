import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { getDatabase, onValue, ref, update } from "firebase/database";

import { getDatabasePath } from "@helpers/client";
import { getPlayers } from "@helpers/players";
import { getRoomId } from "@helpers/room";
import { getCurrentUser } from "@helpers/user";

export const Client = () => {
    const path = useRecoilValue(getDatabasePath);

    const roomId = useRecoilValue(getRoomId);
    const user   = useRecoilValue(getCurrentUser);

    const setPlayers = useSetRecoilState(getPlayers);

    useEffect(() => {
        const db = getDatabase();
        const userDoc = ref(db, path.me);

        update(userDoc, {
            id       : user.uid,
            name     : user.displayName,
            photoURL : user.photoURL,
            online   : true,
        });

        const usersCollection = ref(db, path.users);

        const unsubscribe = onValue(usersCollection, (collection) => {
            const val = collection.val();

            const keys = Object.keys(val);

            const players = keys.map((key) => val[key]);

            setPlayers(players);
        });

        return () => unsubscribe();
    }, [roomId, user]);

    useEffect(() => {
        const listener = () => {
            const db = getDatabase();
            const userDoc = ref(db, path.me);

            update(userDoc, {
                online: false,
            });
        }

        window.addEventListener("beforeunload", listener, false);

        return () => window.removeEventListener("beforeunload", listener, false);
    }, []);

    return null;
}