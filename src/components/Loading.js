import {View, Text, StyleSheet, ActivityIndicator} from 'react-native'
import React from 'react'

export default function Loading({props}) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator {...props} />
        </View>
    )
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});