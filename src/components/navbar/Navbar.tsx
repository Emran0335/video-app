import Link from 'next/link'
import React from 'react'
import Logo from './logo/Logo'
import Search from './search/Search'
import Button from '../button/Button'
import Image from 'next/image'

const Navbar = () => {
  const authStatus = false;
  const userData = null;
  return (
    <nav>
      <Link href='/'>
        <Logo />
      </Link>
      <Search />
      {!authStatus && (
        <div>
          <Link href='/login'>
            <Button>Log in</Button>
          </Link>
          <Link href='/signup'>
          <Button>Sign in</Button>
          </Link>
        </div>
      )}
      {authStatus && userData && (
        <Link href='/channel/userData/username'>
          <Image src={userData} alt='user data is getting'></Image>
        </Link>
      )}
    </nav>
  )
}

export default Navbar