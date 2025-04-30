import { auth } from '@/libs/auth'
import { redirect } from 'next/navigation'
import React, { ComponentType } from 'react'

const withRoleGuard = (Component, allowedRoles) => {
    return async function WrappedComponent(props) {
        const session = await auth()

        if (!session?.user || !allowedRoles.some(role => session.user.roles?.includes(role))) {
            return redirect('/home')
        }

        return <Component {...props} />
    }
}

export default withRoleGuard
