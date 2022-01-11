const aabbaabbcollide=(
    minax,minay,minaz,
    maxax,maxay,maxaz,
    minbx,minby,minbz,
    maxbx,maxby,maxbz
    )=>{
    if(maxax<minbx||maxbx<minax||
        maxay<minby||maxby<minay||
        maxaz<minbz||maxbz<minaz)return false;
    return true;
}