PROJECT_ROOT=$(dirname $0)/../
cd ${PROJECT_ROOT}

for i18n in test-fixtures/*; do
    out=${i18n}/i18n.ts
    rm -Rf ${out}
    yarn start --i ${i18n} --o ${out} --default en
done

yarn jest
