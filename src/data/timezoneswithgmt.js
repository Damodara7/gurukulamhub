const timezones = [
  {
    country: 'United States Minor Outlying Islands',
    timezoneWithGMT: '(GMT -12:00) Eniwetok, Kwajalein',
    countryCode: 'UM'
  },
  {
    country: 'United States',
    timezoneWithGMT: '(GMT -11:00) Midway Island, Samoa',
    countryCode: 'US'
  },
  {
    country: 'United States',
    timezoneWithGMT: '(GMT -10:00) Hawaii',
    countryCode: 'US'
  },
  {
    country: 'French Polynesia',
    timezoneWithGMT: '(GMT -9:30) Taiohae',
    countryCode: 'PF'
  },
  {
    country: 'United States',
    timezoneWithGMT: '(GMT -9:00) Alaska',
    countryCode: 'US'
  },
  {
    country: 'United States, Canada',
    timezoneWithGMT: '(GMT -8:00) Pacific Time (US & Canada)',
    countryCode: 'US, CA'
  },
  {
    country: 'United States, Canada',
    timezoneWithGMT: '(GMT -7:00) Mountain Time (US & Canada)',
    countryCode: 'US, CA'
  },
  {
    country: 'United States, Canada, Mexico',
    timezoneWithGMT: '(GMT -6:00) Central Time (US & Canada), Mexico City',
    countryCode: 'US, CA, MX'
  },
  {
    country: 'United States, Canada, Colombia, Peru',
    timezoneWithGMT: '(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima',
    countryCode: 'US, CA, CO, PE'
  },
  {
    country: 'Venezuela',
    timezoneWithGMT: '(GMT -4:30) Caracas',
    countryCode: 'VE'
  },
  {
    country: 'Canada, Venezuela, Bolivia',
    timezoneWithGMT: '(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz',
    countryCode: 'CA, VE, BO'
  },
  {
    country: 'Canada',
    timezoneWithGMT: '(GMT -3:30) Newfoundland',
    countryCode: 'CA'
  },
  {
    country: 'Brazil, Argentina, Guyana',
    timezoneWithGMT: '(GMT -3:00) Brazil, Buenos Aires, Georgetown',
    countryCode: 'BR, AR, GY'
  },
  {
    country: 'United Kingdom',
    timezoneWithGMT: '(GMT -2:00) Mid-Atlantic',
    countryCode: 'GB'
  },
  {
    country: 'Portugal, Cape Verde',
    timezoneWithGMT: '(GMT -1:00) Azores, Cape Verde Islands',
    countryCode: 'PT, CV'
  },
  {
    country: 'United Kingdom, Portugal, Morocco',
    timezoneWithGMT: '(GMT) Western Europe Time, London, Lisbon, Casablanca',
    countryCode: 'GB, PT, MA'
  },
  {
    country: 'Belgium, Denmark, Spain, France',
    timezoneWithGMT: '(GMT +1:00) Brussels, Copenhagen, Madrid, Paris',
    countryCode: 'BE, DK, ES, FR'
  },
  {
    country: 'Russia, South Africa',
    timezoneWithGMT: '(GMT +2:00) Kaliningrad, South Africa',
    countryCode: 'RU, ZA'
  },
  {
    country: 'Iraq, Saudi Arabia, Russia',
    timezoneWithGMT: '(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg',
    countryCode: 'IQ, SA, RU'
  },
  {
    country: 'Iran',
    timezoneWithGMT: '(GMT +3:30) Tehran',
    countryCode: 'IR'
  },
  {
    country: 'United Arab Emirates, Oman, Azerbaijan, Georgia',
    timezoneWithGMT: '(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi',
    countryCode: 'AE, OM, AZ, GE'
  },
  {
    country: 'Afghanistan',
    timezoneWithGMT: '(GMT +4:30) Kabul',
    countryCode: 'AF'
  },
  {
    country: 'Russia, Pakistan, Uzbekistan',
    timezoneWithGMT: '(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent',
    countryCode: 'RU, PK, UZ'
  },
  {
    country: 'India',
    timezoneWithGMT: '(GMT +5:30) Bombay, Calcutta, Madras, New Delhi',
    countryCode: 'IN'
  },
  {
    country: 'Nepal',
    timezoneWithGMT: '(GMT +5:45) Kathmandu, Pokhara',
    countryCode: 'NP'
  },
  {
    country: 'Kazakhstan, Bangladesh, Sri Lanka',
    timezoneWithGMT: '(GMT +6:00) Almaty, Dhaka, Colombo',
    countryCode: 'KZ, BD, LK'
  },
  {
    country: 'Myanmar',
    timezoneWithGMT: '(GMT +6:30) Yangon, Mandalay',
    countryCode: 'MM'
  },
  {
    country: 'Thailand, Vietnam, Indonesia',
    timezoneWithGMT: '(GMT +7:00) Bangkok, Hanoi, Jakarta',
    countryCode: 'TH, VN, ID'
  },
  {
    country: 'China, Australia, Singapore, Hong Kong',
    timezoneWithGMT: '(GMT +8:00) Beijing, Perth, Singapore, Hong Kong',
    countryCode: 'CN, AU, SG, HK'
  },
  {
    country: 'Australia',
    timezoneWithGMT: '(GMT +8:45) Eucla',
    countryCode: 'AU'
  },
  {
    country: 'Japan, South Korea, Russia',
    timezoneWithGMT: '(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk',
    countryCode: 'JP, KR, RU'
  },
  {
    country: 'Australia',
    timezoneWithGMT: '(GMT +9:30) Adelaide, Darwin',
    countryCode: 'AU'
  },
  {
    country: 'Australia, Guam, Russia',
    timezoneWithGMT: '(GMT +10:00) Eastern Australia, Guam, Vladivostok',
    countryCode: 'AU, GU, RU'
  },
  {
    country: 'Australia',
    timezoneWithGMT: '(GMT +10:30) Lord Howe Island',
    countryCode: 'AU'
  },
  {
    country: 'Russia, Solomon Islands, New Caledonia',
    timezoneWithGMT: '(GMT +11:00) Magadan, Solomon Islands, New Caledonia',
    countryCode: 'RU, SB, NC'
  },
  {
    country: 'Australia',
    timezoneWithGMT: '(GMT +11:30) Norfolk Island',
    countryCode: 'AU'
  },
  {
    country: 'New Zealand, Fiji, Russia',
    timezoneWithGMT: '(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka',
    countryCode: 'NZ, FJ, RU'
  },
  {
    country: 'New Zealand',
    timezoneWithGMT: '(GMT +12:45) Chatham Islands',
    countryCode: 'NZ'
  },
  {
    country: 'Samoa, Tonga',
    timezoneWithGMT: '(GMT +13:00) Apia, Nukualofa',
    countryCode: 'WS, TO'
  },
  {
    country: 'Kiribati, Tokelau',
    timezoneWithGMT: '(GMT +14:00) Line Islands, Tokelau',
    countryCode: 'KI, TK'
  }
]

export { timezones }
export default timezones
