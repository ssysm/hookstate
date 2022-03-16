import {
    Plugin,
    StateValueAtRoot,
    PluginCallbacks,
    State,
} from '@hookstate/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PluginID = Symbol('AsyncRNPersistence');

// tslint:disable-next-line: function-name
export function PersistenceRN(asyncStorageKey: string): () => Plugin {
    return () => ({
        id: PluginID,
        init: (state: State<StateValueAtRoot>) => {
            AsyncStorage.getItem(asyncStorageKey)
                .then((persisted) => {
                    if (persisted !== null) {
                        const result = JSON.parse(persisted);
                        state.set(result);
                    } else if (!state.promised && !!!state.error) {
                        AsyncStorage.setItem(
                            asyncStorageKey,
                            JSON.stringify(state.value)
                        );
                    }
                })
                .catch((error) => {
                    throw 'Fail to get item';
                });
            return {
                onSet: (p) => {
                    if ('state' in p) {
                        AsyncStorage.setItem(
                            asyncStorageKey,
                            JSON.stringify(p.state)
                        );
                    } else {
                        AsyncStorage.removeItem(asyncStorageKey);
                    }
                },
            } as PluginCallbacks;
        },
    });
}
