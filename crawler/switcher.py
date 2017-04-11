def switch_to_classname(x):
    return {
        '34': 'grade',
        '72': 'classname',
        '221': 'krcode',
        '276': 'credit',
        '307': 'timeperweek',
        '337': 'prof',
        '403': 'classcode',
        '458': 'limit',
        '513': 'time',
        '645': 'note',
    }.get(x, ' ')  # default


def switch_to_deptname(x):
    return {
        '10000': '자연(용인)캠퍼스 교양',
        '20000': '인문(서울)캠퍼스 교양',
        '12000': '공과대학',
        '16400': '사회과학대학',
        '16600': '경영대학',
        '11910': '수학과',
        '11915': '물리학과',
        '11920': '화학과',
        '11940': '식품영양학과',
        '11960': '생명과학정보학부',
        '12250': '화학공학과',
        '12361': '신소재공학과',
        '12370': '환경생명공학과',
        '12371': '환경에너지공학과',
        '12450': '토목환경공학과',
        '12500': '교통공학과',
        '12611': '컴퓨터소프트웨어학과',
        '12701': '기계공학과',
        '12755': '산업경영공학과',
        '12831': '정보공학과',
        '12832': '통신공학과',
        '12901': '정보통신공학과',
        '12900': '전기공학과',
        '12908': '전자공학과',
        '12913': '컴퓨터공학과',
        '13720': '의상디자인학과',
        '13725': '체육학부',
        '13730': '체육학부 경기지도학전공',
        '13735': '바둑학과',
        '13750': '음악학부',
        '13781': '디자인학부',
        '13793': '영화뮤지컬학부 영화전공',
        '13794': '영화뮤지컬학부 뮤지컬공연전공',
        '18012': '건축학부',
        '18013': '건축학부 건축학전공',
        '18014': '건축학부 전통건축전공',
        '18015': '공간디자인학과',
        '18016': '건축학부 공간디자인전공',
        '14120': '국어국문학과',
        '14130': '영어영문학과',
        '14140': '중어중문학과',
        '14150': '일어일문학과',
        '16445': '아동학과',
        '16450': '청소년지도학과',
        '14190': '사학과',
        '14200': '문헌정보학과',
        '14210': '아랍지역학과',
        '14212': '미술사학과',
        '14240': '철학과',
        '14250': '문예창작학과',
        '16610': '경영학과',
        '16615': '경영학부 경영학전공',
        '16620': '경영학부 경영정보전공',
        '16410': '행정학과',
        '16420': '경제학과',
        '16425': '정치외교학과',
        '16430': '북한학과',
        '16440': '디지털미디어학과',
        '16640': '경영정보학과',
        '16650': '국제통상학과',
        '16660': '부동산학과',
        '16810': '법학과',
        '18510': '디지털콘텐츠디자인학과',
        '18520': '융합소프트웨어학부',
    }.get(x, ' ')  # default
