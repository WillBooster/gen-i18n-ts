PROJECT_ROOT=$(dirname $0)/../
cd ${PROJECT_ROOT}

tempdir=test-fixtures/temp
rm -Rf ${tempdir}
mkdir ${tempdir}

for i18n in test-fixtures/i18n-*; do
    out=${tempdir}/$(basename ${i18n}).ts
    yarn start --i ${i18n} --o ${out} --default en
done

yarn jest
