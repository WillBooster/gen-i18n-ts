PROJECT_ROOT=$(dirname $0)/../
cd ${PROJECT_ROOT}

tempdir=test-fixtures/temp
rm -Rf ${tempdir}
mkdir ${tempdir}

for i18n in test-fixtures/i18n-*; do
    out=${tempdir}/$(basename ${i18n}).ts
    yarn gen-i18n-ts -i ${i18n} -o ${out} -d en
done

yarn jest
