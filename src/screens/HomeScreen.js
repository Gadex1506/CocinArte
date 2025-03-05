import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import React, { useState } from 'react';
import { MagnifyingGlassIcon,
    AdjustmentHorizontalIcon,
} from 'react-native-heroicons/outline';
import { StatusBar } from 'expo-status-bar';


export default function HomeScreen() {

    const [searchText, setSearchText] = useState('');

    return (
        <View style={styles.container}>
            
            < StatusBar style='light' />

            <SafeAreaView>
                <ScrollView showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ 
                        paddingBottom: 20 
                    }}
                    style={styles.safeStyle}
                >

                {/* Barra de Busqueda */}

                </ScrollView>
            </SafeAreaView>

            
            <View style={styles.searchContainer}>
                < MagnifyingGlassIcon color="#fff" size={20} style={styles.searchIcon}/>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171d24', //191f28
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    safeStyle: {
        paddingTop: 14,
        gap: 6,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
});