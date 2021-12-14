import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.container}>
      <nav className={styles.content}>
        <Link href="/" passHref>
          <a>
            <Image
              className={styles.image}
              src="/assets/logo.svg"
              alt="logo"
              width={240}
              height={26}
            />
          </a>
        </Link>
      </nav>
    </header>
  );
}
