import React from "react";
import { Tabs, Tab, Card, CardBody, CardHeader, Divider, CardFooter, Link } from "@nextui-org/react";
import Spark from "./Spark";
export default function App() {

    return (
        <div className="px-4 p-12">

            <div className="flex w-full flex-col">
                <Tabs aria-label="Options" isVertical={true}>
                    <Tab key="spark" color={'primary'} title={<div className="p-2">讯飞星火</div>} className="flex-1">
                        <Card>
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-md">科大讯飞出品</h4>
                                    <p className="text-small text-default-500">星火3.5模型，新用户可免费获取200万token</p>
                                </div>
                            </CardHeader>
                            <Divider className="mt-2 mb-2" />
                            <CardBody>
                                <Spark></Spark>
                            </CardBody>
                            <Divider className="mt-2 mb-2" />
                            <CardFooter>

                                <div className="flex-col gap-2">
                                    <div> 申请指南</div>
                                    <div className="text-md text-default-500 p-1">
                                        1.  <Link href="https://passport.xfyun.cn/login" isExternal={true}>点击这里</Link>申请账号</div>
                                    <div className="text-md text-default-500 p-1">
                                        2. <Link href="https://console.xfyun.cn/app/myapp" isExternal={true}>点击这里</Link>进入控制台，并创建新应用</div>
                                    <div className="text-md text-default-500 p-1" >
                                        3. 进入应用，在左侧菜单里选择 'Spark3.5 Max'</div>
                                        <div className="text-md text-default-500 p-1" >
                                        4. 选中后，在主面板点击立即购买，可以免费领取个人账户200万tooken用量</div>

                                </div>
                            </CardFooter>

                        </Card>
                    </Tab>
                    <Tab key="kimi" title={<div className="p-2">Kimi</div>} className="flex-1 max-w-26">
                        <Card>
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <div className="flex flex-col">
                                    <h4 className="text-md">月之暗面出品</h4>
                                    <p className="text-small text-default-500">翻译质量较好，新秀的大模型独角兽企业</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="tongyi" className="flex-1" title={<div className="p-2">通义千问</div>}>
                        <Card>
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <div className="flex flex-col">
                                    <h4 className="text-md">阿里巴巴出品</h4>
                                    <p className="text-small text-default-500">靠谱，稳定</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="coze" className="flex-1" title={<div className="p-2">扣子</div>}>
                        <Card>
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <div className="flex flex-col">
                                    <p className="text-md">字节跳动出品</p>
                                    <p className="text-small text-default-500">靠谱，稳定</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
