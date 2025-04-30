import React from 'react'
import './FloatingBar.css'

const IconTool = ({ IconSVG, txtCount }) => {
  return (
    <>
      <div
        className='outline-none!
                    relative
                    flex
                    w-8
                    cursor-pointer
                    items-center
                    sm:w-10'
      >
        <button
          type='button'
          aria-label='Like this article'
          className='outline-none
                    absolute
                    z-50
                    rounded-full
                    p-2
                    hover:bg-slate-100
                    focus:outline-none
                    dark:hover:bg-slate-800'
          data-state='closed'
        >
          {IconSVG ? <IconSVG /> : null}
        </button>
      </div>
      {txtCount ? (
        <div>
          <button
            type='button'
            class='outline-none outline-none! text-sm text-slate-800 hover:underline dark:text-slate-200'
            data-state='closed'
          >
            {txtCount}
          </button>
        </div>
      ) : (
        ''
      )}
    </>
  )
}

const IconToolWrap = ({ iconSVG, txtCount }) => {
  return (
    <div
      className='
    outline-none!
    relative
    flex
    cursor-pointer
    items-center'
    >
      <IconTool IconSVG={iconSVG} txtCount={txtCount} />
    </div>
  )
}

const VerticalBar = () => {
  return (
    <div
      data-orientation='vertical'
      aria-orientation='vertical'
      role='separator'
      className='my-auto w-px
                bg-slate-200
                dark:bg-slate-600
                mx-2 h-5'
    ></div>
  )
}

const FloatingToolSet = () => {
  return (
    <div
      className='
        shadow-xl
        text-slate-800
        text-sm
        py-1
        px-2
        bg-white
        border-slate-200
        border-1_2
        rounded-full
        justify-center
        items-center
        flex-wrap
        shrink
        h-12
        flex
        mx-auto
       relative
         '
    >
      <IconToolWrap iconSVG={SVG_Heart} />
      <VerticalBar />
      <IconToolWrap iconSVG={SVG_Comment} />
      <VerticalBar />
      <IconToolWrap iconSVG={SVG_TOC} />
      <VerticalBar />
      <IconToolWrap iconSVG={SVG_Bookmark} />
      <VerticalBar />
      <IconToolWrap iconSVG={SVG_Dollor} />
      <VerticalBar />
      <IconToolWrap iconSVG={SVG_Share} />
      <VerticalBar />
      {/* <IconToolWrap iconSVG={SVG_more} /> */}
    </div>
  )
}

const FloatingBar = () => {
  return (
    <div
      className='
            post-floating-bar
            active
            animation
            flex
            flex-wrap
            absolute
            sticky
            justify-center
            w-full
            h-12
            z-50
            right-0
            left-0
            bottom-5
 '
    >
      <FloatingToolSet></FloatingToolSet>
    </div>
  )
}

const SVG_Comment = () => {
  return (
    <svg
      class='h-4 w-4 stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6.5 10.6667H9.83333M6.5 7.75H12.3333M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 9.99762 1.69478 10.9497 2.04839 11.8204C2.11606 11.9871 2.1499 12.0704 2.165 12.1377C2.17976 12.2036 2.18516 12.2524 2.18517 12.3199C2.18518 12.3889 2.17265 12.4641 2.14759 12.6145L1.65344 15.5794C1.60169 15.8898 1.57582 16.0451 1.62397 16.1573C1.66611 16.2556 1.7444 16.3339 1.84265 16.376C1.95491 16.4242 2.11015 16.3983 2.42063 16.3466L5.38554 15.8524C5.53591 15.8273 5.61109 15.8148 5.68011 15.8148C5.74763 15.8148 5.79638 15.8202 5.86227 15.835C5.92962 15.8501 6.01294 15.8839 6.17958 15.9516C7.05025 16.3052 8.00238 16.5 9 16.5Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}

const SVG_TOC = () => {
  return (
    <svg
      class='h-4 w-4 fill-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
      viewBox='0 0 512 512'
    >
      <path d='M88 56H40a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16V72a16 16 0 00-16-16zm0 160H40a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16v-48a16 16 0 00-16-16zm0 160H40a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16v-48a16 16 0 00-16-16zm416 24H168a8 8 0 00-8 8v16a8 8 0 008 8h336a8 8 0 008-8v-16a8 8 0 00-8-8zm0-320H168a8 8 0 00-8 8v16a8 8 0 008 8h336a8 8 0 008-8V88a8 8 0 00-8-8zm0 160H168a8 8 0 00-8 8v16a8 8 0 008 8h336a8 8 0 008-8v-16a8 8 0 00-8-8z'></path>
    </svg>
  )
}

const SVG_Bookmark = () => {
  return (
    <svg
      viewBox='0 0 16 20'
      class='h-4 w-4 scale-[0.97] stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M15.2 19V5.8C15.2 4.11984 15.2 3.27976 14.8731 2.63803C14.5854 2.07354 14.1265 1.6146 13.562 1.32698C12.9203 1 12.0802 1 10.4 1H5.60005C3.91989 1 3.07981 1 2.43808 1.32698C1.87359 1.6146 1.41465 2.07354 1.12703 2.63803C0.800049 3.27976 0.800049 4.11984 0.800049 5.8V19L5.85342 16.4733C6.64052 16.0798 7.03406 15.883 7.44686 15.8055C7.81246 15.737 8.18764 15.737 8.55324 15.8055C8.96603 15.883 9.35959 16.0798 10.1467 16.4733L15.2 19Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}
const SVG_Dollor = () => {
  return (
    <svg
      viewBox='0 0 22 22'
      class='h-4 w-4 stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M11.0001 6.99997C9.3431 6.99997 8.0001 7.89497 8.0001 8.99997C8.0001 10.105 9.3431 11 11.0001 11C12.6571 11 14.0001 11.895 14.0001 13C14.0001 14.105 12.6571 15 11.0001 15M11.0001 6.99997C12.1101 6.99997 13.0801 7.40197 13.5991 7.99997M11.0001 6.99997V5.49997M11.0001 15V16.5M11.0001 15C9.8901 15 8.9201 14.598 8.4011 14M6.56747 3.2279C7.33085 3.16697 8.05556 2.86681 8.63846 2.37013C9.29713 1.8085 10.1344 1.5 11 1.5C11.8656 1.5 12.7029 1.8085 13.3615 2.37013C13.9444 2.86681 14.6692 3.16697 15.4325 3.2279C16.2954 3.29654 17.1055 3.67043 17.7175 4.28247C18.3296 4.89451 18.7035 5.70464 18.7721 6.56747C18.833 7.33085 19.1332 8.05556 19.6299 8.63846C20.1915 9.29713 20.5 10.1344 20.5 11C20.5 11.8656 20.1915 12.7029 19.6299 13.3615C19.1332 13.9444 18.833 14.6692 18.7721 15.4325C18.7035 16.2954 18.3296 17.1055 17.7175 17.7175C17.1055 18.3296 16.2954 18.7035 15.4325 18.7721C14.6692 18.833 13.9444 19.1332 13.3615 19.6299C12.7029 20.1915 11.8656 20.5 11 20.5C10.1344 20.5 9.29713 20.1915 8.63846 19.6299C8.05556 19.1332 7.33085 18.833 6.56747 18.7721C5.70464 18.7035 4.89451 18.3296 4.28247 17.7175C3.67043 17.1055 3.29654 16.2954 3.2279 15.4325C3.16697 14.6692 2.86681 13.9444 2.37013 13.3615C1.8085 12.7029 1.5 11.8656 1.5 11C1.5 10.1344 1.8085 9.29713 2.37013 8.63846C2.86681 8.05556 3.16697 7.33085 3.2279 6.56747C3.29654 5.70464 3.67043 4.89451 4.28247 4.28247C4.89451 3.67043 5.70464 3.29654 6.56747 3.2279Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}

const SVG_Share = () => {
  return (
    <svg
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      class='h-4 w-4 stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
    >
      <path
        d='M6.25 7.91667L11.75 5.08333M6.25 10.0833L11.75 12.9167M6.5 9C6.5 10.3807 5.38071 11.5 4 11.5C2.61929 11.5 1.5 10.3807 1.5 9C1.5 7.61929 2.61929 6.5 4 6.5C5.38071 6.5 6.5 7.61929 6.5 9ZM16.5 4C16.5 5.38071 15.3807 6.5 14 6.5C12.6193 6.5 11.5 5.38071 11.5 4C11.5 2.61929 12.6193 1.5 14 1.5C15.3807 1.5 16.5 2.61929 16.5 4ZM16.5 14C16.5 15.3807 15.3807 16.5 14 16.5C12.6193 16.5 11.5 15.3807 11.5 14C11.5 12.6193 12.6193 11.5 14 11.5C15.3807 11.5 16.5 12.6193 16.5 14Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}

const SVG_more = () => {
  return (
    <svg
      viewBox='0 0 24 24'
      class='h-4 w-4 scale-[1.1] fill-current stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z'></path>
      <path d='M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z'></path>
      <path d='M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z'></path>
      <path
        d='M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
      <path
        d='M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
      <path
        d='M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}

const SVG_Heart = () => {
  return (
    <svg
      viewBox='0 0 22 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='h-4
                            w-4
                            sm:h-5
                            sm:w-5
                            2xl:h-6
                            2xl:w-6
                            stroke-current
                            text-slate-800
                            dark:text-slate-50'
    >
      <path
        d='M11 19C12 19 21 14.0002 21 7.00043C21 3.50057 18 1.04405 15 1.00065C13.5 0.978943 12 1.50065 11 3.00059C10 1.50065 8.47405 1.00065 7 1.00065C4 1.00065 1 3.50057 1 7.00043C1 14.0002 10 19 11 19Z'
        strokeWidth='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></path>
    </svg>
  )
}

export default FloatingBar
